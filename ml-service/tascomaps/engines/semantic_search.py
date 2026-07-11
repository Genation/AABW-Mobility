"""P7 semantic retrieval and constraint-aware ranking.

The engine deliberately separates candidate recall from final ranking:

* several query views and both retrieval modalities are combined with RRF;
* structured evidence adds a small recall-safety candidate union;
* scores are normalized against the corpus, never against the selected pool;
* explicit constraints form relaxation tiers while missing metadata stays
  unknown instead of being treated as a negative observation.

No evaluation rows or POI identifiers are used here.  All normalizers and
priors are derived from the currently loaded corpus.
"""
from __future__ import annotations

import bisect
import math
import re
from dataclasses import dataclass, field, replace
from datetime import datetime
from statistics import median
from typing import Dict, Iterable, List, Optional, Sequence

import numpy as np
from rapidfuzz import fuzz

from ..constants import canon_city
from ..core.text import fold, has_accents, normalize, tokenize
from ..core.understand import QueryUnderstanding, understand
from ..data.kb import KnowledgeBase, POI
from ..index.store import HybridIndex


# Query-dependent signals are renormalized over the active subset.  Values are
# deliberately modest: a single business signal must not overwhelm relevance.
WEIGHTS = {
    "relevance": 0.50,
    "name": 0.40,
    "category": 0.12,
    "attributes": 0.16,
    "location": 0.18,
    "hours": 0.12,
    "brand": 0.08,
    "price": 0.06,
    "rating": 0.08,
    "popularity": 0.06,
}

_TIME_RANGE_RE = re.compile(
    r"(?P<start>\d{1,2}):(?P<start_min>\d{2})\s*[-–]\s*"
    r"(?P<end>\d{1,2}):(?P<end_min>\d{2})")
_NEGATION_RE = re.compile(
    r"\b(?:khong(?:\s+(?:co|qua|muon|can))?|tranh|loai tru|without|no)\b")
_NEGATED_CAPTURE_RE = re.compile(
    r"\b(?:khong(?:\s+(?:co|qua|muon|can))?|tranh|without|no)\s+"
    r"(?P<value>[a-z0-9/-]+(?:\s+[a-z0-9/-]+)?)")
_CAPTURE_STOP = {"o", "tai", "gan", "cho", "de", "voi", "la", "va", "nhung"}
_CLAUSE_BOUNDARY_RE = re.compile(
    r"\b(?:nhung|but|however|con|ma|whereas|va\s+co)\b")
_ATTRIBUTE_MATCH_THRESHOLD = 0.62
_CORE_CATEGORY_INTENTS = frozenset({
    "Category Search",
    "Nearby Search",
    "Discovery Search",
    "Brand Category Search",
    "Navigation",
})


@dataclass
class RankedResult:
    poi: POI
    score: float
    reasons: List[str] = field(default_factory=list)
    signals: Dict[str, float] = field(default_factory=dict)
    # Internal only: known violations define controlled-relaxation tiers.
    violations: int = 0
    unknowns: int = 0
    # Explicit location constraints are never relaxed across cities/regions.
    location_state: Optional[bool] = None

    def to_dict(self) -> dict:
        return {
            "poi_id": self.poi.poi_id, "name": self.poi.name,
            "source": self.poi.source,
            "identity_key": f"{self.poi.source}:{self.poi.poi_id}",
            "display_name": self.poi.name, "address": self.poi.address,
            "category": self.poi.category, "district": self.poi.district,
            "city": self.poi.city, "rating": self.poi.rating,
            "review_count": self.poi.review_count,
            "brand": self.poi.brand or None,
            "lat": self.poi.lat, "lng": self.poi.lng,
            "score": round(_clip01(self.score), 4), "reasons": self.reasons,
            "signals": {k: round(_clip01(v), 3)
                        for k, v in self.signals.items()},
        }


def _clip01(value: float) -> float:
    try:
        value = float(value)
    except (TypeError, ValueError):
        return 0.0
    return min(1.0, max(0.0, value)) if math.isfinite(value) else 0.0


def _contains_phrase(document: str, phrase: str) -> bool:
    """Boundary-safe lookup in already-folded metadata text."""
    return bool(phrase and re.search(
        r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", document))


def _haversine(a, b) -> float:
    (lat1, lon1), (lat2, lon2) = a, b
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(min(1.0, math.sqrt(max(0.0, h))))


def _coordinates(lat, lng) -> Optional[tuple[float, float]]:
    """Validate coordinates without rejecting valid zero values."""
    if lat is None or lng is None:
        return None
    try:
        lat, lng = float(lat), float(lng)
    except (TypeError, ValueError):
        return None
    if not (math.isfinite(lat) and math.isfinite(lng)):
        return None
    return (lat, lng) if -90 <= lat <= 90 and -180 <= lng <= 180 else None


def _as_datetime(value) -> Optional[datetime]:
    if value is None or isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None


class SemanticSearchEngine:
    def __init__(self, kb: KnowledgeBase):
        self.kb = kb
        self.pois = kb.pois_t2 or kb.pois
        # P7's dense index intentionally stays on the rich T2 corpus.  The
        # unified catalog is used only for exact identity/category fallback,
        # so sparse cross-track rows cannot perturb ordinary semantic ranking.
        self.catalog_pois = kb.pois
        self.index = HybridIndex(self.pois)
        self._position = {id(p): i for i, p in enumerate(self.pois)}
        self._landmark_cache: Dict[str, Optional[tuple]] = {}
        self._address_cache: Dict[str, Optional[tuple]] = {}
        self._attribute_cache: Dict[tuple[str, ...], np.ndarray] = {}
        self._identity_member_cache: Dict[str, frozenset[int]] = {}

        self._attribute_docs = [
            " . ".join(x for x in [" ; ".join(p.attributes),
                                    " ; ".join(p.tags), p.description] if x)
            for p in self.pois
        ]
        self._attribute_known = np.asarray(
            [bool(fold(text)) for text in self._attribute_docs], dtype=bool)
        if self.pois:
            try:
                self._attribute_emb = self.index.embedder.encode_docs(self._attribute_docs)
            except Exception:
                self._attribute_emb = np.zeros_like(self.index.doc_emb)
        else:
            self._attribute_emb = np.zeros((0, 1), dtype=np.float32)

        known_attributes: Dict[str, str] = {}
        for row in kb.attribute_taxonomy:
            value = str(row.get("attribute") or "").strip()
            if value:
                known_attributes.setdefault(fold(value), value)
        for p in self.pois:
            for value in p.attributes:
                if value:
                    known_attributes.setdefault(fold(value), value)
        self._known_attributes = known_attributes

        # A tiny, corpus-derived orthographic model guards against arbitrary
        # embedding matches for nonwords.  Character trigrams preserve open-
        # vocabulary searches (new words usually share subword structure with
        # the corpus) without maintaining a language- or query-specific list.
        corpus_tokens = {
            token
            for p in self.pois
            for token in re.findall(r"[^\W_]+", fold(p.search_text))
            if token
        }
        self._corpus_char_ngrams = {
            token[start:start + 3]
            for token in corpus_tokens
            for start in range(max(0, len(token) - 2))
        }
        # Calibrate the plausibility floor from ordinary one-edit corruptions
        # of live corpus words. Queries with less subword support than these
        # tolerated typos need independent lexical/entity evidence.
        typo_support = []
        for token in corpus_tokens:
            if len(token) < 4:
                continue
            middle = len(token) // 2
            corrupted = token[:middle] + token[middle] + token[middle:]
            grams = [corrupted[start:start + 3]
                     for start in range(len(corrupted) - 2)]
            typo_support.append(sum(
                gram in self._corpus_char_ngrams for gram in grams) / len(grams))
        self._orthographic_ood_floor = float(
            np.percentile(typo_support, 5)) if typo_support else 1.0

        ratings = [float(p.rating) for p in self.pois if p.rating is not None]
        self._rating_prior = sum(ratings) / len(ratings) if ratings else 3.5
        reviews = sorted(p.review_count for p in self.pois if p.review_count > 0)
        self._rating_prior_strength = max(1.0, float(median(reviews))) if reviews else 10.0
        self._popularity_values = sorted(
            float(p.popularity_score) for p in self.pois
            if p.popularity_score is not None)
        self._dense_ood_floor = self._derive_dense_ood_floor()

    # -- corpus-derived calibration -------------------------------------
    def _derive_dense_ood_floor(self) -> float:
        """Estimate a conservative dense-evidence floor from POI-name probes."""
        if not self.pois:
            return 1.0
        step = max(1, len(self.pois) // 32)
        sample = self.pois[::step][:32]
        try:
            queries = self.index.embedder.encode_queries([p.name for p in sample])
        except Exception:
            return 1e-6
        tops = []
        docs = np.asarray(self.index.doc_emb, dtype=np.float32)
        for query in np.asarray(queries, dtype=np.float32):
            scores = np.sum(docs * query[None, :], axis=1)
            finite = scores[np.isfinite(scores)]
            if finite.size:
                tops.append(float(finite.max()))
        if not tops:
            return 1e-6
        # Leave room for natural-language needs, which are less similar than
        # exact names.  Bounds keep this meaningful for TF-IDF and E5 alike.
        return float(np.clip(np.percentile(tops, 10) - 0.08, 0.40, 0.88))

    def _orthographic_support(self, query: str) -> float:
        """Fraction of query subwords observed anywhere in the live corpus."""
        grams = []
        for token in re.findall(r"[^\W_]+", fold(query)):
            if len(token) < 3:
                grams.append(token)
            else:
                grams.extend(token[start:start + 3]
                             for start in range(len(token) - 2))
        if not grams:
            return 0.0
        return sum(gram in self._corpus_char_ngrams for gram in grams) / len(grams)

    def _bayesian_rating(self, p: POI) -> float:
        if p.rating is None:
            return _clip01(self._rating_prior / 5.0)
        count = max(0.0, float(p.review_count or 0))
        strength = self._rating_prior_strength
        estimate = (count * float(p.rating) + strength * self._rating_prior) \
            / (count + strength)
        return _clip01(estimate / 5.0)

    def _popularity(self, p: POI) -> float:
        if not self._popularity_values or p.popularity_score is None:
            return 0.5
        position = bisect.bisect_right(
            self._popularity_values, float(p.popularity_score))
        return _clip01((position - 0.5) / len(self._popularity_values))

    # -- attribute evidence ---------------------------------------------
    def _required_attributes(self, u: QueryUnderstanding) -> List[str]:
        e = u.entities or {}
        attrs: List[str] = []
        if e.get("attribute"):
            attrs.append(str(e["attribute"]))
        attrs.extend(str(x) for x in (e.get("attributes") or []) if x)
        return self._dedupe(attrs)

    @staticmethod
    def _dedupe(values: Iterable[str]) -> List[str]:
        out, seen = [], set()
        for value in values:
            value = str(value).strip()
            key = fold(value)
            if key and key not in seen:
                seen.add(key)
                out.append(value)
        return out

    def _ground_attribute(self, value: str) -> Optional[str]:
        """Ground a free-form attribute in corpus/taxonomy vocabulary."""
        vf = fold(value)
        if not vf:
            return None
        if vf in self._known_attributes:
            return self._known_attributes[vf]
        best = max(
            ((fuzz.token_set_ratio(vf, candidate), canonical)
             for candidate, canonical in self._known_attributes.items()),
            default=(0, None), key=lambda item: item[0])
        return best[1] if best[0] >= 85 else None

    @staticmethod
    def _locally_negated(qfold: str, attribute_fold: str) -> bool:
        """True only when a nearby negator governs this attribute occurrence."""
        start = qfold.find(attribute_fold)
        while start >= 0:
            prefix = qfold[:start]
            boundaries = list(_CLAUSE_BOUNDARY_RE.finditer(prefix))
            local = prefix[boundaries[-1].end():] if boundaries else prefix
            negations = list(_NEGATION_RE.finditer(local))
            if negations:
                tail = local[negations[-1].end():].strip().split()
                # Conjunctions terminate a local negative scope.  A small
                # allowance supports natural modifiers without reaching into
                # the next positive clause.
                if len(tail) <= 3 and not ({"va", "nhung", "but"} & set(tail)):
                    return True
            start = qfold.find(attribute_fold, start + len(attribute_fold))
        return False

    def _excluded_attributes(self, query: str, u: QueryUnderstanding,
                             required: Sequence[str]) -> List[str]:
        """Merge structured exclusions with generic local negation scopes."""
        e = u.entities or {}
        excluded: List[str] = []
        if e.get("excluded_attribute"):
            excluded.append(str(e["excluded_attribute"]))
        excluded.extend(str(x) for x in (e.get("excluded_attributes") or []) if x)
        qf = fold(query)

        # Prefer known corpus attributes; this catches multi-word values without
        # maintaining a query-specific synonym list in the ranker.
        for attr_fold, canonical in self._known_attributes.items():
            if not attr_fold or attr_fold not in qf:
                continue
            if self._locally_negated(qf, attr_fold):
                excluded.append(canonical)

        # Capture unseen attributes after a negator.  Keep the first token too,
        # because the second token may be a preposition ("không wifi ở ...").
        for match in _NEGATED_CAPTURE_RE.finditer(qf):
            phrase = match.group("value").strip()
            tokens = phrase.split()
            if tokens and tokens[0] not in _CAPTURE_STOP:
                candidates = [tokens[0]]
                if len(tokens) > 1 and tokens[1] not in _CAPTURE_STOP:
                    candidates.insert(0, phrase)
                grounded = None
                for value in candidates:
                    grounded = self._ground_attribute(value)
                    if grounded:
                        break
                if grounded:
                    excluded.append(grounded)

        # A requirement under negative scope is an exclusion, not both.
        for attr in required:
            af = fold(attr)
            if af and self._locally_negated(qf, af):
                excluded.append(attr)
        return self._dedupe(excluded)

    def _attribute_match_scores(self, requirements: Sequence[str]) -> np.ndarray:
        """Return ``requirements x POIs`` semantic/fuzzy match scores."""
        key = tuple(fold(x) for x in requirements if fold(x))
        if not key:
            return np.zeros((0, len(self.pois)), dtype=np.float32)
        cached = self._attribute_cache.get(key)
        if cached is not None:
            return cached

        try:
            query_vectors = self.index.embedder.encode_queries(list(requirements))
        except Exception:
            query_vectors = np.zeros(
                (len(requirements), self._attribute_emb.shape[1]), dtype=np.float32)
        semantic_rows = []
        for vector in np.asarray(query_vectors, dtype=np.float32):
            raw = np.sum(self._attribute_emb * vector[None, :], axis=1)
            raw = np.nan_to_num(raw, nan=0.0, posinf=0.0, neginf=0.0)
            finite = raw[self._attribute_known]
            if finite.size:
                lo, hi = np.percentile(finite, [15, 95])
                semantic = np.clip((raw - lo) / max(1e-6, hi - lo), 0.0, 1.0)
            else:
                semantic = np.zeros(len(self.pois), dtype=np.float32)
            semantic_rows.append(semantic)

        matrix = np.zeros((len(key), len(self.pois)), dtype=np.float32)
        folded_docs = [fold(text) for text in self._attribute_docs]
        phrase_sets = [
            [fold(x) for x in [*p.attributes, *p.tags, p.description] if fold(x)]
            for p in self.pois
        ]
        for row, requirement in enumerate(key):
            grounded = self._ground_attribute(requirement) is not None
            information = len(re.sub(r"[^a-z0-9]", "", requirement))
            lexical_row = []
            for idx, doc in enumerate(folded_docs):
                if not doc:
                    matrix[row, idx] = 0.5  # genuinely unknown metadata
                    lexical_row.append(0.0)
                    continue
                if requirement in doc:
                    lexical = 1.0
                else:
                    lexical = max(
                        (fuzz.token_set_ratio(requirement, value) / 100.0
                         for value in phrase_sets[idx]), default=0.0)
                lexical_row.append(lexical)
                exact_lexical = any(
                    _contains_phrase(value, requirement)
                    for value in phrase_sets[idx])
                semantic = float(semantic_rows[row][idx])
                # Strong lexical matches are reliable; otherwise semantic
                # evidence supplies graded recall without claiming certainty.
                if lexical >= 0.72:
                    score = 0.65 * lexical + 0.35 * semantic
                else:
                    score = max(0.55 * lexical, 0.78 * semantic)
                # Very short folded requirements carry too little information
                # for fuzzy/embedding evidence alone to assert a strict match
                # (e.g. ``mon Y`` versus every field containing ``mon``).
                # Exact metadata remains authoritative.
                if information < 5 and not exact_lexical:
                    score = min(score, _ATTRIBUTE_MATCH_THRESHOLD - 0.01)
                matrix[row, idx] = _clip01(score)
            # Relative semantic scaling must not manufacture a match for an
            # attribute absent from both taxonomy and corpus text.
            if not grounded and max(lexical_row, default=0.0) < 0.55:
                matrix[row, :] = np.asarray(lexical_row, dtype=np.float32) * 0.55

        if len(self._attribute_cache) >= 128:
            self._attribute_cache.clear()
        self._attribute_cache[key] = matrix
        return matrix

    def _attr_score(self, p: POI, required: Sequence[str]):
        """Backward-compatible per-POI attribute score helper."""
        if not required:
            return 0.5, []
        idx = self._position.get(id(p))
        if idx is None:
            return 0.5, []
        matrix = self._attribute_match_scores(required)
        values = matrix[:, idx]
        matched = [value for value, score in zip(required, values)
                   if score >= _ATTRIBUTE_MATCH_THRESHOLD]
        return float(values.mean()) if values.size else 0.5, matched

    def _positive_attribute_evidence(
            self, idx: int, required: Sequence[str], scores: np.ndarray):
        """Return score, matches, known violations, and metadata unknowns."""
        if not required:
            return 0.5, [], 0, 0
        values = scores[:, idx]
        matched = [value for value, score in zip(required, values)
                   if score >= _ATTRIBUTE_MATCH_THRESHOLD]
        if not bool(self._attribute_known[idx]):
            # Missing attribute/review/description metadata is not a negative
            # observation. Each requested requirement remains independently
            # unknown for controlled relaxation.
            return 0.5, [], 0, len(required)
        violations = sum(
            float(score) < _ATTRIBUTE_MATCH_THRESHOLD for score in values)
        return float(values.mean()) if values.size else 0.5, matched, violations, 0

    # -- opening-time evidence ------------------------------------------
    @staticmethod
    def _parse_time_range(value: str) -> Optional[tuple[int, int]]:
        match = _TIME_RANGE_RE.search(value or "")
        if not match:
            return None
        start = int(match["start"]) * 60 + int(match["start_min"])
        end = int(match["end"]) * 60 + int(match["end_min"])
        if not (0 <= start < 24 * 60 and 0 <= end < 24 * 60):
            return None
        if end <= start:
            end += 24 * 60
        return start, end

    def _hours_score(self, p: POI, entities: dict, as_of=None):
        """Return ``(score, reason, constrained)``; 0.5 means unknown."""
        requested = entities.get("open_after")
        requested_before = entities.get("open_before")
        wants_late = bool(entities.get("open_late"))
        wants_24h = bool(entities.get("open_24h"))
        # An upstream parser may conservatively also emit ``open_now`` for an
        # explicit bound.  Bounds are more specific and take precedence.
        wants_now = bool(entities.get("open_now")) \
            and not requested and not requested_before
        if not (requested or requested_before or wants_late or wants_24h or wants_now):
            return 0.5, None, False

        hay = fold(" ; ".join([p.opening_hours, *p.attributes, *p.tags]))
        is_24h = any(term in hay for term in ("24/7", "24h", "24 gio"))
        parsed = self._parse_time_range(p.opening_hours)
        has_hours = bool((p.opening_hours or "").strip()) or is_24h

        if wants_24h:
            if is_24h:
                return 1.0, "mở cửa 24/7", True
            return (0.0 if has_hours else 0.5), None, True

        if wants_now:
            moment = _as_datetime(as_of)
            if moment is None:
                return 0.5, None, True
            if is_24h:
                return 1.0, "đang mở cửa", True
            if parsed is None:
                return (0.0 if has_hours else 0.5), None, True
            start, end = parsed
            target = moment.hour * 60 + moment.minute
            if target < start and end > 24 * 60:
                target += 24 * 60
            ok = start <= target <= end
            return (1.0, "đang mở cửa", True) if ok else (0.0, None, True)

        if requested or requested_before:
            labels = ([f"sau {requested}"] if requested else []) \
                + ([f"trước {requested_before}"] if requested_before else [])
            reason = "mở " + " và ".join(labels)
            if is_24h:
                return 1.0, reason, True
            if parsed is None:
                return (0.0 if has_hours else 0.5), None, True
            start, end = parsed
            checks = []
            for value, relation in ((requested, "after"),
                                    (requested_before, "before")):
                if not value:
                    continue
                try:
                    hour, minute = map(int, str(value).split(":"))
                    target = hour * 60 + minute
                except (TypeError, ValueError):
                    return 0.5, None, True
                if relation == "after":
                    if target < start and end > 24 * 60:
                        target += 24 * 60
                    checks.append(start <= target <= end)
                else:
                    checks.append(start <= target)
            return (1.0, reason, True) if all(checks) else (0.0, None, True)

        closes_late = bool(parsed and parsed[1] >= 23 * 60)
        keyword_late = any(term in hay for term in
                           ("mo khuya", "mo muon", "late-night", "night-view"))
        if is_24h or closes_late or keyword_late:
            return 1.0, "mở khuya", True
        return (0.0 if has_hours else 0.5), None, True

    # -- location evidence ----------------------------------------------
    @staticmethod
    def _centroid(points: Sequence[tuple[float, float]]) -> Optional[tuple]:
        if not points:
            return None
        return (float(median(x for x, _ in points)),
                float(median(y for _, y in points)))

    def _resolve_landmark(self, name: str) -> Optional[tuple]:
        """Resolve exact/admin/address references before conservative fuzzy use."""
        nf = fold(name)
        if not nf:
            return None
        if nf in self._landmark_cache:
            return self._landmark_cache[nf]

        # Administrative areas resolve to a robust corpus centroid, never to
        # the first POI whose name happens to contain the area.
        admin_points = []
        if nf in self.kb.cities:
            admin_points = [(p.lat, p.lng) for p in self.kb.pois
                            if _coordinates(p.lat, p.lng)
                            and fold(p.city) == nf]
        elif nf in self.kb.districts:
            admin_points = [(p.lat, p.lng) for p in self.kb.pois
                            if _coordinates(p.lat, p.lng)
                            and fold(p.district) == nf]
        if admin_points:
            self._landmark_cache[nf] = self._centroid(admin_points)
            return self._landmark_cache[nf]

        exact_points, contained_points, poi_address_points = [], [], []
        fuzzy_candidates = []
        for p in self.kb.pois:
            coords = _coordinates(p.lat, p.lng)
            if coords is None:
                continue
            forms = [p.name, p.name_en, *p.aliases]
            folded = [fold(value) for value in forms if value]
            address_fold = fold(p.address)
            if len(nf) >= 4 and address_fold and re.search(
                    r"(?<!\w)" + re.escape(nf) + r"(?!\w)", address_fold):
                poi_address_points.append(coords)
            if nf in folded:
                exact_points.append(coords)
                continue
            if any(len(nf) >= 5 and (nf in value or value in nf) for value in folded):
                contained_points.append(coords)
            best = max((fuzz.WRatio(nf, value) for value in folded), default=0)
            if best >= 91:
                fuzzy_candidates.append((best, p.popularity_score or 0, coords))
        if exact_points:
            answer = self._centroid(exact_points)
        else:
            address_points = []
            for address in self.kb.addresses:
                coords = _coordinates(address.get("latitude"), address.get("longitude"))
                hay = fold(" ".join(str(address.get(key) or "") for key in
                                    ("full_address", "street", "district", "city")))
                if coords and len(nf) >= 4 and nf in hay:
                    address_points.append(coords)
            address_points.extend(poi_address_points)
            if address_points:
                answer = self._centroid(address_points)
            elif len(contained_points) == 1:
                answer = contained_points[0]
            elif fuzzy_candidates:
                answer = max(fuzzy_candidates, key=lambda value: (value[0], value[1]))[2]
            else:
                answer = None
        self._landmark_cache[nf] = answer
        return answer

    def _resolve_reference_address(self, value: str) -> Optional[tuple]:
        """Resolve an address against address rows and geocoded POI addresses."""
        target = fold(value)
        if not target:
            return None
        if target in self._address_cache:
            return self._address_cache[target]

        candidates: List[tuple[float, tuple[float, float]]] = []
        target_number = re.match(
            r"^(\d+[a-z]?(?:/\d+[a-z]?)?)\b", target)

        def add_candidate(surface, lat, lng):
            coords = _coordinates(lat, lng)
            candidate = fold(str(surface or ""))
            if coords is None or not candidate:
                return
            candidate_number = re.match(
                r"^(\d+[a-z]?(?:/\d+[a-z]?)?)\b", candidate)
            if (target_number and (not candidate_number
                    or target_number.group(1) != candidate_number.group(1))):
                return
            if target == candidate:
                score = 1.0
            else:
                same_number = bool(
                    target_number and candidate_number
                    and target_number.group(1) == candidate_number.group(1))
                contained = bool(
                    len(target) >= 4 and same_number
                    and (re.search(r"(?<!\w)" + re.escape(target) + r"(?!\w)",
                                   candidate)
                         or re.search(r"(?<!\w)" + re.escape(candidate)
                                      + r"(?!\w)", target)))
                if contained:
                    # Administrative suffixes are commonly omitted from a
                    # typed reference address. Equal house number plus a
                    # boundary-safe contained street phrase is strong evidence.
                    score = 0.98
                else:
                    score = fuzz.WRatio(target, candidate) / 100.0
            if score >= 0.86:
                candidates.append((score, coords))

        for address in self.kb.addresses:
            forms = [address.get("full_address")]
            components = " ".join(str(address.get(key) or "") for key in
                                  ("house_number", "street", "ward",
                                   "district", "city"))
            if components.strip():
                forms.append(components)
            for surface in forms:
                add_candidate(surface, address.get("latitude"),
                              address.get("longitude"))
        for p in self.kb.pois:
            add_candidate(p.address, p.lat, p.lng)

        if not candidates:
            answer = None
        else:
            best = max(score for score, _ in candidates)
            # Equivalent canonical/address-row representations may coexist.
            # Nearby duplicates can be safely centroided, but equally strong
            # matches in different places are an ambiguous address—not a point
            # halfway between cities.
            top_coords = [coords for score, coords in candidates
                          if score >= best - 0.005]
            separated = any(
                _haversine(left, right) > 0.5
                for position, left in enumerate(top_coords)
                for right in top_coords[position + 1:]
            )
            answer = None if separated else self._centroid(top_coords)
        self._address_cache[target] = answer
        return answer

    def _location_context(self, u: QueryUnderstanding,
                          user_location: Optional[tuple]) -> dict:
        e = u.entities or {}
        ref = e.get("reference_poi") or e.get("reference_area") or e.get("location")
        reference_address = e.get("reference_address")
        entity_coords = _coordinates(e.get("latitude"), e.get("longitude"))
        if entity_coords:
            coords, source, radius = entity_coords, "query_coordinates", 15.0
        elif reference_address:
            coords = self._resolve_reference_address(str(reference_address))
            source = "reference_address" if coords else "unresolved_reference_address"
            radius = 5.0
        elif ref and ref != "current_location":
            coords = self._resolve_landmark(str(ref))
            source = "reference" if coords else "unresolved_reference"
            radius = 20.0 if e.get("reference_area") else 10.0
        elif ref == "current_location" or u.intent == "Nearby Search":
            coords, source, radius = user_location, "user_location", 15.0
        elif (u.intent == "Navigation" and e.get("origin") and e.get("category")
              and not (e.get("city") or e.get("district"))):
            coords = self._resolve_landmark(str(e["origin"]))
            source = "route_origin" if coords else "unresolved_route_origin"
            # Origin proximity is a ranking prior for category destinations,
            # never a hard radius constraint on a possible route.
            radius = float("inf")
            route_distances = []
            if coords:
                requested_category = fold(e["category"])
                for poi in self.catalog_pois:
                    if fold(poi.category) != requested_category:
                        continue
                    poi_coords = _coordinates(poi.lat, poi.lng)
                    if poi_coords:
                        route_distances.append(_haversine(coords, poi_coords))
            # Calibrate the soft decay from the nearest live destination of
            # this type.  It remains useful for both local and genuinely long
            # routes without a query/category-specific distance constant.
            route_scale = max(3.0, 2.0 * min(route_distances)) \
                if route_distances else 15.0
        elif user_location is not None and not (e.get("city") or e.get("district")):
            # Coordinates supplied by the caller are useful context even when
            # the text omits an explicit "near me" phrase.  A named remote area
            # above always wins over this implicit local context.
            coords, source, radius = user_location, "user_location_context", 25.0
        else:
            coords, source, radius = None, None, 15.0
        constrained = bool(e.get("city") or e.get("district") or ref
                           or reference_address or entity_coords or coords)
        answer = {"coords": coords, "source": source, "radius_km": radius,
                  "constrained": constrained}
        if source == "route_origin":
            answer["rank_scale_km"] = route_scale
        return answer

    @staticmethod
    def _hard_location_kind(u: QueryUnderstanding) -> Optional[str]:
        """Identify location requirements that must not be silently relaxed."""
        entities = u.entities or {}
        if _coordinates(entities.get("latitude"), entities.get("longitude")):
            return "query_coordinates"
        if entities.get("reference_address"):
            return "reference_address"
        reference = (entities.get("reference_poi")
                     or entities.get("reference_area")
                     or entities.get("location"))
        if reference == "current_location":
            return "current_location"
        if reference:
            return "reference"
        # A route destination is not a constraint on en-route search results.
        if not entities.get("route_destination"):
            if entities.get("district"):
                return "district"
            if entities.get("city"):
                return "city"
        if u.intent == "Nearby Search":
            return "current_location"
        return None

    def _location_evidence(self, p: POI, u: QueryUnderstanding, context: dict):
        e = u.entities or {}
        scores, states, reasons = [], [], []
        # A route destination is not the city in which an en-route POI must sit.
        use_admin = not bool(e.get("route_destination"))
        if use_admin and e.get("city"):
            if not p.city:
                scores.append(0.5); states.append(None)
            elif fold(canon_city(e["city"])) == fold(canon_city(p.city)):
                scores.append(1.0); states.append(True); reasons.append(f"tại {p.city}")
            else:
                scores.append(0.0); states.append(False)
        if use_admin and e.get("district"):
            if not p.district:
                district_fold = fold(e["district"])
                address_has_district = bool(
                    district_fold and re.search(
                        r"(?<!\w)" + re.escape(district_fold) + r"(?!\w)",
                        fold(p.address)))
                if address_has_district:
                    scores.append(1.0); states.append(True)
                    reasons.append(f"thuộc {e['district']}")
                else:
                    scores.append(0.5); states.append(None)
            elif fold(e["district"]) == fold(p.district):
                scores.append(1.0); states.append(True); reasons.append(f"thuộc {p.district}")
            else:
                scores.append(0.0); states.append(False)

        distance = None
        if context.get("coords") is not None:
            poi_coords = _coordinates(p.lat, p.lng)
            if poi_coords is None:
                scores.append(0.5); states.append(None)
            else:
                distance = _haversine(context["coords"], poi_coords)
                scores.append(self._distance_relevance(distance, context))
                states.append(True if context.get("source") == "route_origin"
                              else distance <= context["radius_km"])
                if distance < 20.0:
                    reasons.append(f"cách ~{distance:.1f} km")
        elif context.get("constrained") and not (e.get("city") or e.get("district")):
            scores.append(0.5); states.append(None)

        if not scores:
            return 0.5, reasons, None, distance, False
        state = False if False in states else (None if None in states else True)
        return float(sum(scores) / len(scores)), reasons, state, distance, True

    @staticmethod
    def _distance_relevance(distance: float, context: dict) -> float:
        decay = (float(context.get("rank_scale_km") or 3.0)
                 if context.get("source") == "route_origin" else 3.0)
        return math.exp(-float(distance) / max(decay, 1e-6))

    def _location_score(self, p: POI, u: QueryUnderstanding,
                        user_location: Optional[tuple] = None):
        context = self._location_context(u, user_location)
        score, reasons, _, _, _ = self._location_evidence(p, u, context)
        return score, reasons

    # -- retrieval views and candidate recall ---------------------------
    def _query_views(self, query: str, u: QueryUnderstanding,
                     required: Sequence[str]) -> List[str]:
        e = u.entities or {}
        structured = []
        for key in ("poi_name", "category", "brand", "dish", "district", "city",
                    "reference_poi", "reference_area", "reference_address", "street"):
            if e.get(key):
                structured.append(str(e[key]))
        structured.extend(required)
        if e.get("open_after"):
            structured.extend(["mở cửa", str(e["open_after"])])
        if e.get("open_before"):
            structured.extend(["mở cửa", str(e["open_before"])])
        if e.get("open_late"):
            structured.append("mở khuya")
        if e.get("open_24h"):
            structured.append("24/7")
        # Prefer the canonical surface when raw/canonical fold to the same key;
        # otherwise case and punctuation noise can change dense-only tie order.
        views = [u.normalized_query, query]
        if structured:
            views.append(" ".join(structured))
        return self._dedupe(views)

    def _structured_union(self, entities: dict, required_scores: np.ndarray,
                          hours: Sequence[float], limit: int) -> List[tuple[int, float]]:
        """Select a bounded recall-safety set from structured corpus evidence."""
        ranked = []
        for idx, p in enumerate(self.pois):
            evidence, conflict = 0.0, False
            if entities.get("poi_name"):
                exact = id(p) in self._grounded_identity_members(
                    str(entities["poi_name"]))
                evidence += 5.0 if exact else 0.0
            if entities.get("category"):
                if p.category and fold(p.category) == fold(entities["category"]):
                    evidence += 2.0
                elif p.category:
                    conflict = True
            if entities.get("city") and not entities.get("route_destination"):
                if p.city and fold(canon_city(p.city)) == fold(canon_city(entities["city"])):
                    evidence += 2.0
                elif p.city:
                    conflict = True
            if entities.get("district") and not entities.get("route_destination"):
                if p.district and fold(p.district) == fold(entities["district"]):
                    evidence += 2.0
                elif p.district:
                    conflict = True
            if required_scores.size:
                evidence += float(required_scores[:, idx].mean())
            if hours and hours[idx] >= 0.99:
                evidence += 1.5
            if evidence > 0 and not conflict:
                quality = self._bayesian_rating(p) + self._popularity(p)
                ranked.append((idx, evidence, quality))
        ranked.sort(key=lambda value: (-value[1], -value[2], value[0]))
        return [(idx, min(0.35, 0.06 * evidence))
                for idx, evidence, _ in ranked[:limit]]

    @staticmethod
    def _meaningful_entities(entities: dict) -> bool:
        ignored = {"candidates", "ambiguity_type"}
        return any(value not in (None, "", [], {}) for key, value in entities.items()
                   if key not in ignored)

    @staticmethod
    def _identity_forms(poi: POI) -> set[str]:
        return {
            fold(value) for value in (poi.name, poi.name_en, *poi.aliases)
            if fold(value)
        }

    @staticmethod
    def _same_physical_identity(left: POI, right: POI) -> bool:
        left_coords = _coordinates(left.lat, left.lng)
        right_coords = _coordinates(right.lat, right.lng)
        if left_coords and right_coords:
            return _haversine(left_coords, right_coords) <= 0.2
        return bool(
            fold(left.address) and fold(left.address) == fold(right.address)
            and (not left.city or not right.city
                 or fold(left.city) == fold(right.city)))

    @classmethod
    def _merge_poi_records(cls, primary: POI, secondary: POI) -> POI:
        """Fill complementary metadata for two proven physical records."""
        merged = replace(primary)
        for name in (
                "name_en", "brand", "sub_category", "address", "ward",
                "district", "city", "opening_hours", "description"):
            if not getattr(merged, name) and getattr(secondary, name):
                setattr(merged, name, getattr(secondary, name))
        for name in ("lat", "lng", "rating", "price_level"):
            if getattr(merged, name) is None and getattr(secondary, name) is not None:
                setattr(merged, name, getattr(secondary, name))
        merged.review_count = max(
            int(primary.review_count or 0), int(secondary.review_count or 0))
        merged.popularity_score = max(
            float(primary.popularity_score or 0.0),
            float(secondary.popularity_score or 0.0))
        for name in ("attributes", "tags", "aliases"):
            values, seen = [], set()
            for value in [*getattr(primary, name), *getattr(secondary, name)]:
                key = fold(value)
                if key and key not in seen:
                    seen.add(key)
                    values.append(value)
            setattr(merged, name, values)
        return merged

    def _deduplicate_ranked(
            self, results: Sequence[RankedResult]) -> tuple[List[RankedResult], int]:
        """Merge only same-name records proven to be the same physical POI."""
        deduplicated: List[RankedResult] = []
        duplicate_count = 0
        for result in results:
            duplicate = next((
                existing for existing in deduplicated
                if fold(existing.poi.name) == fold(result.poi.name)
                and self._same_physical_identity(existing.poi, result.poi)
            ), None)
            if duplicate is None:
                deduplicated.append(result)
                continue
            duplicate.poi = self._merge_poi_records(
                duplicate.poi, result.poi)
            duplicate_count += 1
        return deduplicated, duplicate_count

    @staticmethod
    def _specialization_state(
            poi: POI, specialization: str,
            parent_category: Optional[str] = None) -> Optional[bool]:
        """Return canonical identity evidence for an explicit specialization."""
        target = normalize(specialization)
        if not target:
            return True
        pattern = r"(?<!\w)" + re.escape(target) + r"(?!\w)"
        if (parent_category and poi.category
                and fold(poi.category) != fold(parent_category)):
            return False
        identity_text = " ".join(filter(None, (
            poi.name, poi.name_en, poi.sub_category, *poi.aliases,
        )))
        if re.search(pattern, normalize(identity_text)):
            return True
        # A populated canonical subtype that names something else is negative
        # evidence. Sparse records remain unknown rather than becoming matches
        # through noisy attributes, tags, descriptions, or dense similarity.
        return False if poi.sub_category else None

    @staticmethod
    def _diversify_generic_results(
            results: Sequence[RankedResult], u: QueryUnderstanding) \
            -> tuple[List[RankedResult], int]:
        """Limit repeated display identities without merging physical branches."""
        entities = u.entities or {}
        if (u.intent not in {"Category Search", "Discovery Search", "Nearby Search"}
                or entities.get("brand") or entities.get("poi_name")):
            return list(results), 0

        diversified: List[RankedResult] = []
        seen = set()
        suppressed = 0
        for result in results:
            key = fold(result.poi.name)
            if key in seen:
                suppressed += 1
                continue
            seen.add(key)
            diversified.append(result)
        return diversified, suppressed

    def _grounded_identity_members(self, name: str) -> frozenset[int]:
        """Resolve an exact catalog name to safe cross-track equivalents."""
        key = fold(name)
        if not key:
            return frozenset()
        cached = self._identity_member_cache.get(key)
        if cached is not None:
            return cached

        anchors = [poi for poi in self.catalog_pois
                   if key in self._identity_forms(poi)]
        members = {id(poi) for poi in anchors}
        # A source may spell the same physical branch slightly differently
        # while exposing the other spelling as an alias. Merge only when that
        # shared surface is backed by address/coordinate identity; generic or
        # ambiguous aliases cannot join unrelated branches.
        for anchor in anchors:
            anchor_forms = self._identity_forms(anchor)
            for poi in self.catalog_pois:
                if id(poi) in members:
                    continue
                if (anchor_forms & self._identity_forms(poi)
                        and self._same_physical_identity(anchor, poi)):
                    members.add(id(poi))
        answer = frozenset(members)
        if len(self._identity_member_cache) >= 512:
            self._identity_member_cache.clear()
        self._identity_member_cache[key] = answer
        return answer

    def _core_identity(
            self, u: QueryUnderstanding) -> tuple[Optional[str], Optional[str]]:
        """Return non-relaxable name/category constraints grounded by P6."""
        entities = u.entities or {}
        raw_name = str(entities.get("poi_name") or "").strip() or None
        # After P6 rejects payload-less aliases and constraint-shaped facility
        # phrases, every remaining specific name is a core identity. Unknown
        # named places safely yield no_matches instead of unrelated venues.
        name = raw_name
        category = None
        raw_category = str(entities.get("category") or "").strip() or None
        grounded_brand_category = bool(
            u.intent == "Brand Category Search" and entities.get("brand"))
        if (raw_category and u.intent in _CORE_CATEGORY_INTENTS
                and (grounded_brand_category
                     or self._category_is_core(u.raw, u, raw_category))):
            category = raw_category
        return name, category

    def _actionable_brand_ambiguity(
            self, u: QueryUnderstanding) -> Optional[QueryUnderstanding]:
        """Ground a bare multi-branch brand for ranked venue search only."""
        entities = u.entities or {}
        if (u.intent != "Ambiguous"
                or entities.get("ambiguity_type") != "brand_or_branch"):
            return None

        query_key = fold(u.normalized_query or u.raw)
        grounded = {
            (poi.brand, poi.category)
            for poi in self.catalog_pois
            if poi.brand and fold(poi.brand) == query_key
        }
        if len(grounded) != 1:
            return None

        brand, category = grounded.pop()
        return replace(
            u,
            intent="Brand Category Search",
            entities={"brand": brand, "category": category},
        )

    def _category_is_core(
            self, query: str, u: QueryUnderstanding, category: str) -> bool:
        """Distinguish a requested type from a type mentioned as an amenity.

        Category surfaces after containment language (``có nhiều nhà hàng``)
        and short generic aliases buried mid-query remain soft ranking clues.
        Bare/head categories, abbreviations, progressive categories, and
        destination categories stay non-relaxable.
        """
        raw_tokens = tokenize(query)
        folded_tokens = [fold(token) for token in raw_tokens]
        canonical_size = len(fold(category).split())
        query_has_accents = has_accents(query)
        leading_fillers = {
            "tim", "cho", "toi", "minh", "muon", "can", "hay", "giup",
            "di", "den", "toi", "chi", "duong", "navigate", "directions",
        }
        containment = {
            "co", "nhieu", "gom", "kem", "voi", "phuc", "vu", "inside",
            "with", "has", "gan", "quanh", "canh", "near", "around",
        }
        debug = u.debug or {}
        abbreviation_surfaces = [
            surface for surface, expansion
            in (debug.get("abbrev") or {}).items()
            if fold(expansion) == fold(category)
        ]
        has_category_span = any(
            span_type == "category" and fold(canonical) == fold(category)
            for span_type, canonical in debug.get("spans", [])
        )
        attribute_phrases = [
            fold(value).split() for value in debug.get("attrs", []) if fold(value)
        ]

        def owned_by_attribute(start: int, target: List[str]) -> bool:
            for attribute in attribute_phrases:
                if len(attribute) <= len(target):
                    continue
                for offset in range(len(attribute) - len(target) + 1):
                    if attribute[offset:offset + len(target)] != target:
                        continue
                    left = start - offset
                    if (left >= 0 and folded_tokens[left:left + len(attribute)]
                            == attribute):
                        return True
            return False

        # Abbreviations are strong typed evidence, but they still obey the
        # same clause ownership as canonical surfaces.  Thus bare ``bx`` is a
        # requested category while ``dia diem co nhieu ATM`` is a contained
        # amenity rather than a hard ATM-only filter.
        for surface in abbreviation_surfaces:
            target = fold(surface).split()
            if not target:
                continue
            for start in range(len(folded_tokens) - len(target) + 1):
                end = start + len(target)
                if folded_tokens[start:end] != target:
                    continue
                suffix = folded_tokens[end:end + 2]
                existential = "nao" in suffix or "gi" in suffix
                local_prefix = folded_tokens[max(0, start - 3):start]
                if containment & set(local_prefix) and not existential:
                    continue
                if owned_by_attribute(start, target):
                    continue
                return True

        matched_surface = False
        for surface, canonical in self.kb.category_terms.items():
            if fold(canonical) != fold(category):
                continue
            target = fold(surface).split()
            if not target or len(target) > len(raw_tokens):
                continue
            for start in range(len(raw_tokens) - len(target) + 1):
                end = start + len(target)
                if folded_tokens[start:end] != target:
                    continue
                raw_surface = " ".join(raw_tokens[start:end])
                # In an otherwise accented query, do not turn an ordinary
                # unaccented function word into an accented minimal pair. A
                # real accentless alias such as ``cafe`` remains available as
                # its own taxonomy surface.
                if (has_accents(raw_surface)
                        and normalize(raw_surface) != normalize(surface)):
                    continue
                if (query_has_accents and has_accents(surface)
                        and not has_accents(raw_surface)
                        and normalize(raw_surface) != normalize(surface)):
                    continue
                matched_surface = True
                if owned_by_attribute(start, target):
                    continue
                prefix = folded_tokens[:start]
                local_prefix = prefix[-3:]
                suffix = folded_tokens[end:end + 2]
                existential = "nao" in suffix or "gi" in suffix
                if containment & set(local_prefix) and not existential:
                    continue
                nonfill = [token for token in prefix
                           if token not in leading_fillers]
                if len(target) < canonical_size and nonfill \
                        and not has_category_span:
                    continue
                return True

        prefix_hint = debug.get("first_token_prefix") or {}
        if (prefix_hint.get("type") == "category"
                and fold(prefix_hint.get("canonical")) == fold(category)):
            return True
        # P6's conservative whole-phrase single-edit recovery has no exact
        # category span. Reproduce only that high-confidence shape here so a
        # typo does not turn a hard category into an unrelated semantic query.
        query_fold = fold(query)
        query_size = len(query_fold.split())
        if any(
            fold(canonical) == fold(category)
            and len(fold(surface).split()) == query_size
            and fuzz.ratio(query_fold, fold(surface)) >= 92.0
            for surface, canonical in self.kb.category_terms.items()
        ):
            return True
        if (u.entities or {}).get("dish") and not matched_surface:
            return True
        return False

    @staticmethod
    def _boundary_count(text: str, phrase: str) -> int:
        target = fold(phrase)
        if not target:
            return 0
        return len(re.findall(
            r"(?<!\w)" + re.escape(target) + r"(?!\w)", fold(text)))

    def _location_understanding(
            self, query: str, u: QueryUnderstanding,
            core_name: Optional[str]) -> QueryUnderstanding:
        """Remove admin words owned solely by a grounded POI identity."""
        if not core_name:
            return u
        entities = dict(u.entities or {})
        changed = False
        for key in ("city", "district"):
            value = entities.get(key)
            if not value or self._boundary_count(core_name, value) == 0:
                continue
            if self._boundary_count(query, value) \
                    <= self._boundary_count(core_name, value):
                entities.pop(key, None)
                changed = True
        if not changed:
            return u
        return QueryUnderstanding(
            raw=u.raw, normalized_query=u.normalized_query, intent=u.intent,
            entities=entities, confidence=u.confidence, source=u.source,
            debug=dict(u.debug))

    def _matches_core_identity(self, poi: POI, name: Optional[str],
                               category: Optional[str],
                               brand: Optional[str] = None) -> bool:
        if name and id(poi) not in self._grounded_identity_members(name):
            return False
        if category and fold(poi.category) != fold(category):
            return False
        if brand:
            brand_hay = fold(" ".join((poi.brand, poi.name)))
            if fold(brand) not in brand_hay:
                return False
        return bool(name or category)

    def _catalog_attribute_scores(
            self, poi: POI, requirements: Sequence[str]) \
            -> tuple[List[float], List[bool]]:
        """Lexical attribute evidence for exact catalog fallback rows.

        Cross-track records do not participate in the dense attribute index.
        Their dedicated metadata is still safe to use; importantly, names and
        categories are excluded so identity tokens cannot become attributes.
        """
        if not requirements:
            return [], []
        identity_documents = [
            fold(value) for value in
            (poi.name, poi.name_en, poi.category, *poi.aliases) if fold(value)
        ]

        def identity_owned(value: str) -> bool:
            value_fold = fold(value)
            return any(_contains_phrase(identity, value_fold)
                       for identity in identity_documents)

        fields = [value for value in (*poi.attributes, *poi.tags)
                  if value and not identity_owned(value)]
        if poi.description:
            fields.append(poi.description)
        folded_fields = [fold(value) for value in fields if fold(value)]
        if not folded_fields:
            return [0.5] * len(requirements), [False] * len(requirements)
        document = " ; ".join(folded_fields)
        scores = []
        for requirement in requirements:
            target = fold(requirement)
            canonical_keys = {target} if target else set()
            for surface, canonical in self.kb.attribute_terms.items():
                if target in {fold(surface), fold(canonical)}:
                    canonical_keys.add(fold(canonical))
            variants = {key for key in canonical_keys if key}
            for surface, canonical in self.kb.attribute_terms.items():
                if fold(canonical) in canonical_keys:
                    variants.update((fold(surface), fold(canonical)))
            variants.discard("")
            if any(_contains_phrase(document, variant)
                   for variant in variants):
                score = 1.0
            else:
                score = max(
                    (fuzz.token_set_ratio(variant, value) / 100.0
                     for variant in variants
                     for value in folded_fields), default=0.0)
            scores.append(_clip01(score))
        return scores, [
            score >= _ATTRIBUTE_MATCH_THRESHOLD for score in scores
        ]

    def _rank_catalog_identity(
            self, query: str, u: QueryUnderstanding,
            candidates: Sequence[POI], required: Sequence[str],
            excluded: Sequence[str], location_context: dict,
            hard_location: Optional[str], moment: Optional[datetime],
            location_u: Optional[QueryUnderstanding] = None) \
            -> tuple[List[RankedResult], int, int]:
        """Rank exact catalog matches without expanding the semantic index."""
        entities = u.entities or {}
        location_u = location_u or u
        wants_name = entities.get("poi_name")
        wants_category = entities.get("category")
        wants_brand = entities.get("brand")
        hours_constrained = bool(
            entities.get("open_after") or entities.get("open_late")
            or entities.get("open_before") or entities.get("open_24h")
            or entities.get("open_now"))
        price_preference = bool(
            entities.get("price_max") is not None
            or entities.get("price_level_max") is not None)

        active_weights = {
            "relevance": WEIGHTS["relevance"],
            "rating": WEIGHTS["rating"],
            "popularity": WEIGHTS["popularity"],
        }
        if wants_name:
            active_weights["name"] = WEIGHTS["name"]
        if wants_category:
            active_weights["category"] = WEIGHTS["category"]
        if required or excluded:
            active_weights["attributes"] = WEIGHTS["attributes"]
        if location_context["constrained"]:
            active_weights["location"] = WEIGHTS["location"]
        if hours_constrained:
            active_weights["hours"] = WEIGHTS["hours"]
        if wants_brand:
            active_weights["brand"] = WEIGHTS["brand"]
        if price_preference:
            active_weights["price"] = WEIGHTS["price"]
        weight_total = sum(active_weights.values()) or 1.0

        ranked: List[RankedResult] = []
        for poi in candidates:
            reasons: List[str] = []
            signals: Dict[str, float] = {"relevance": 1.0}
            violations = unknowns = 0
            forms = self._identity_forms(poi)

            if wants_name:
                exact_name = fold(wants_name) in forms
                signals["name"] = 1.0 if exact_name else 0.0
                if exact_name:
                    reasons.append("đúng địa điểm")
                else:
                    violations += 1
            if wants_category:
                category_match = fold(poi.category) == fold(wants_category)
                signals["category"] = 1.0 if category_match else 0.0
                if category_match:
                    reasons.append(f"đúng loại {poi.category}")
                elif u.intent in _CORE_CATEGORY_INTENTS:
                    violations += 1

            positive_values, positive_known = \
                self._catalog_attribute_scores(poi, required)
            if required:
                matched = [
                    value for value, known in zip(required, positive_known)
                    if known
                ]
                unknowns += sum(not known for known in positive_known)
                if matched:
                    reasons.append("phù hợp: " + ", ".join(matched))
                effective = [
                    score if known else 0.5
                    for score, known in zip(positive_values, positive_known)
                ]
                positive_score = sum(effective) / len(effective)
            else:
                positive_score = 0.5

            excluded_values, exclusion_known = \
                self._catalog_attribute_scores(poi, excluded)
            if excluded:
                violations += sum(exclusion_known)
                unknowns += sum(not known for known in exclusion_known)
                effective = [
                    1.0 - score if known else 0.5
                    for score, known in zip(excluded_values, exclusion_known)
                ]
                exclusion_score = sum(effective) / len(effective)
            else:
                exclusion_score = 0.5
            if required or excluded:
                parts = ([positive_score] if required else []) \
                    + ([exclusion_score] if excluded else [])
                signals["attributes"] = sum(parts) / len(parts)
                signals["excluded_attributes"] = exclusion_score

            location_score, location_reasons, location_state, distance, constrained = \
                self._location_evidence(poi, location_u, location_context)
            if constrained:
                signals["location"] = location_score
                reasons.extend(location_reasons)
                if location_state is False:
                    violations += 1
                elif location_state is None:
                    unknowns += 1
                if distance is not None:
                    signals["distance"] = self._distance_relevance(
                        distance, location_context)
            if hard_location and location_state is not True:
                continue

            hours_score, hours_reason, constrained = \
                self._hours_score(poi, entities, moment)
            signals["hours"] = hours_score
            if constrained:
                if hours_reason:
                    reasons.append(hours_reason)
                if hours_score <= 0.01:
                    violations += 1
                elif 0.49 <= hours_score <= 0.51:
                    unknowns += 1

            if wants_brand:
                brand_hay = fold(" ".join((poi.brand, poi.name)))
                if not brand_hay:
                    brand_score = 0.5
                    unknowns += 1
                elif fold(wants_brand) in brand_hay:
                    brand_score = 1.0
                    reasons.append(f"đúng thương hiệu {wants_brand}")
                else:
                    brand_score = 0.0
                    if u.intent == "Brand Category Search":
                        violations += 1
                signals["brand"] = brand_score

            if price_preference:
                if poi.price_level is None:
                    price_score = 0.5
                    unknowns += 1
                else:
                    price_score = 1.0 - (
                        min(4, max(1, poi.price_level)) - 1) / 3.0
                    level_max = entities.get("price_level_max")
                    if level_max is not None \
                            and poi.price_level > float(level_max):
                        violations += 1
                signals["price"] = price_score

            signals["rating"] = self._bayesian_rating(poi)
            signals["popularity"] = self._popularity(poi)
            if poi.rating and poi.rating >= 4.3:
                reasons.append(f"đánh giá {poi.rating}★")
            if signals["popularity"] >= 0.8:
                reasons.append("phổ biến")
            rating_min = entities.get("rating_min")
            if rating_min is not None:
                if poi.rating is None:
                    unknowns += 1
                elif poi.rating < float(rating_min):
                    violations += 1

            # Do not infer constraints from tokens that are solely the exact
            # POI identity (for example a name containing ``24h``).
            if wants_name and fold(query) in forms:
                violations = 0
                unknowns = 0

            score = sum(
                weight * signals.get(name, 0.5)
                for name, weight in active_weights.items()) / weight_total
            score *= 0.96 ** unknowns
            score *= 0.62 ** violations
            ranked.append(RankedResult(
                poi=poi, score=_clip01(score),
                reasons=self._dedupe(reasons)[:4], signals=signals,
                violations=violations, unknowns=unknowns,
                location_state=location_state if constrained else None))

        ranked.sort(key=lambda result: (
            result.violations, result.unknowns, -result.score,
            result.poi.name, result.poi.poi_id, result.poi.source))

        deduplicated, duplicate_count = self._deduplicate_ranked(ranked)
        return deduplicated, len(ranked), duplicate_count

    @staticmethod
    def _ranked_payload(results: Sequence[RankedResult], top_k: int) -> List[dict]:
        selected = list(results[:top_k])
        display_counts: Dict[str, int] = {}
        for result in selected:
            key = fold(result.poi.name)
            display_counts[key] = display_counts.get(key, 0) + 1
        payload = []
        for result in selected:
            row = result.to_dict()
            if display_counts.get(fold(result.poi.name), 0) > 1:
                qualifier = result.poi.address or ", ".join(
                    value for value in (result.poi.district, result.poi.city)
                    if value) or result.poi.poi_id
                row["display_name"] = f"{result.poi.name} — {qualifier}"
            payload.append(row)
        return payload

    # -- main ------------------------------------------------------------
    def search(self, query: str, top_k: int = 5, candidate_k: Optional[int] = None,
               latitude: Optional[float] = None, longitude: Optional[float] = None,
               as_of=None) -> dict:
        query = str(query or "")[:512]
        n_docs = len(self.pois)
        top_k = min(max(1, int(top_k or 1)), min(50, n_docs or 1))
        public_u = understand(query, self.kb)
        u = public_u
        public_entities = public_u.entities or {}
        ambiguity_type = public_entities.get("ambiguity_type")
        if (fold(query) and n_docs and public_u.intent == "Ambiguous"
                and ambiguity_type != "no_match"):
            actionable = self._actionable_brand_ambiguity(public_u)
            if actionable is None:
                return {
                    "query": query,
                    "understanding": public_u.to_dict(),
                    "required_attributes": [],
                    "excluded_attributes": [],
                    "results": [],
                    "diagnostics": {
                        "status": "ambiguous_query", "candidate_count": 0,
                    },
                }
            u = actionable
        e = u.entities or {}
        required = self._required_attributes(u)
        excluded = self._excluded_attributes(query, u, required)
        excluded_folds = {fold(x) for x in excluded}
        required = [x for x in required if fold(x) not in excluded_folds]

        base_response = {
            "query": query,
            "understanding": public_u.to_dict(),
            "required_attributes": required,
            "excluded_attributes": excluded,
        }
        if not fold(query) or not n_docs:
            return {**base_response, "results": [],
                    "diagnostics": {"status": "empty_query", "candidate_count": 0}}
        if (u.intent == "Navigation" and e.get("route_destination")
                and not (e.get("poi_name") or e.get("category"))):
            # A city-to-city (or district-to-district) route is already fully
            # understood, but it is not a venue-retrieval request.  Returning
            # arbitrary semantic POIs here would be actively misleading.
            return {
                **base_response,
                "results": [],
                "diagnostics": {
                    "status": "navigation_only", "candidate_count": 0,
                    "origin": e.get("origin"),
                    "destination": e.get("route_destination"),
                },
            }

        moment = _as_datetime(as_of)
        core_name, core_category = self._core_identity(u)
        location_u = self._location_understanding(query, u, core_name)
        location_entities = location_u.entities or {}
        ranking_entities = dict(location_entities)
        if ranking_entities.get("category") and not core_category:
            ranking_entities.pop("category", None)
        ranking_u = replace(location_u, entities=ranking_entities)
        user_location = _coordinates(latitude, longitude)
        location_context = self._location_context(location_u, user_location)
        hard_location = self._hard_location_kind(location_u)
        if hard_location == "current_location" and user_location is None:
            return {**base_response, "results": [],
                    "diagnostics": {
                        "status": "needs_location", "candidate_count": 0,
                        "hard_location": hard_location,
                        "location_source": location_context.get("source"),
                    }}
        has_admin_fallback = bool(
            not location_entities.get("route_destination")
            and (location_entities.get("city")
                 or location_entities.get("district")))
        unresolved_precise_address = bool(
            hard_location == "reference_address"
            and location_context.get("coords") is None)
        unresolved_reference = bool(
            hard_location == "reference"
            and location_context.get("coords") is None
            and not has_admin_fallback)
        if unresolved_precise_address or unresolved_reference:
            return {**base_response, "results": [],
                    "diagnostics": {
                        "status": "no_matches", "candidate_count": 0,
                        "reason": "unresolved_location",
                        "hard_location": hard_location,
                        "location_source": location_context.get("source"),
                    }}

        core_brand = None
        if not core_name and core_category and u.intent == "Brand Category Search":
            core_brand = str(e.get("brand") or "").strip() or None

        # The rich T2 index remains the primary search corpus.  When it cannot
        # represent a grounded core identity at all, consult only exact matches
        # from the unified catalog.  This sidecar is deliberately bounded and
        # never introduces unrelated rows into semantic candidate retrieval.
        if core_name or core_category:
            active_identity = [
                poi for poi in self.pois
                if self._matches_core_identity(
                    poi, core_name, core_category, core_brand)
            ]
            if not active_identity:
                catalog_identity = [
                    poi for poi in self.catalog_pois
                    if self._matches_core_identity(
                        poi, core_name, core_category, core_brand)
                ]
                (catalog_results, catalog_ranked_count,
                 catalog_duplicate_count) = self._rank_catalog_identity(
                    query, u, catalog_identity, required, excluded,
                    location_context, hard_location, moment, location_u)
                specialization = e.get("sub_category") or e.get("dish")
                specialization_unknowns = 0
                if specialization:
                    states = [
                        (result, self._specialization_state(
                            result.poi, specialization, core_category))
                        for result in catalog_results
                    ]
                    specialization_unknowns = sum(
                        state is None for _, state in states)
                    catalog_results = [
                        result for result, state in states if state is True
                    ]
                catalog_results, diversified_count = \
                    self._diversify_generic_results(catalog_results, u)
                if catalog_results:
                    strict_count = sum(
                        result.violations == 0 and result.unknowns == 0
                        for result in catalog_results)
                    unknown_count = sum(
                        result.violations == 0 and result.unknowns > 0
                        for result in catalog_results)
                    returned_count = min(top_k, len(catalog_results))
                    status = ("ok" if strict_count >= returned_count
                              else "constraints_relaxed")
                    return {
                        **base_response,
                        "results": self._ranked_payload(catalog_results, top_k),
                        "diagnostics": {
                            "status": status,
                            "candidate_count": len(catalog_results),
                            "pre_filter_candidate_count": len(catalog_identity),
                            "post_location_candidate_count": catalog_ranked_count,
                            "deduplicated_count": catalog_duplicate_count,
                            "diversified_count": diversified_count,
                            "retrieved_count": 0,
                            "structured_union_count": 0,
                            "catalog_match_count": len(catalog_identity),
                            "strict_candidate_count": strict_count,
                            "unknown_candidate_count": unknown_count,
                            "specialization_unknown_candidate_count":
                                specialization_unknowns,
                            "rank_window": 0,
                            "query_view_count": 0,
                            "location_source": location_context.get("source"),
                            "hard_location": hard_location,
                            "source_scope": "unified_catalog",
                            "fallback_reason": (
                                "core_identity_absent_from_active_corpus"),
                        },
                    }

                if specialization and not catalog_results:
                    reason = "no_strict_specialization_candidates"
                elif catalog_identity and hard_location:
                    reason = "no_strict_location_candidates"
                elif core_name:
                    reason = "entity_not_in_search_corpus"
                else:
                    reason = "no_strict_category_candidates"
                return {
                    **base_response,
                    "results": [],
                    "diagnostics": {
                        "status": "no_matches",
                        "candidate_count": 0,
                        "pre_filter_candidate_count": len(catalog_identity),
                        "strict_candidate_count": 0,
                        "reason": reason,
                        "hard_location": hard_location,
                        "location_source": location_context.get("source"),
                        "source_scope": "unified_catalog",
                    },
                }

        default_candidates = max(32, top_k * 8, int(math.ceil(math.sqrt(n_docs) * 4)))
        if candidate_k is None:
            candidate_limit = min(n_docs, default_candidates)
        else:
            candidate_limit = min(n_docs, max(top_k, min(500, int(candidate_k))))
        # Independent of candidate_limit: expanding the returned pool must not
        # change fused relevance scores for candidates already present.
        rank_window = min(n_docs, max(64, int(math.ceil(math.sqrt(n_docs) * 8))))
        views = self._query_views(query, ranking_u, required)
        fused = self.index.retrieve_fused(
            views, top_k=candidate_limit, rank_window=rank_window)

        max_dense = max((value[1] for value in fused), default=0.0)
        max_lexical = max((value[2] for value in fused), default=0.0)
        orthographic_support = self._orthographic_support(query)
        if (not self._meaningful_entities(e) and max_lexical <= 0.0
                and (max_dense < self._dense_ood_floor
                     or orthographic_support + 1e-12
                     < self._orthographic_ood_floor)):
            return {**base_response, "results": [],
                    "diagnostics": {
                        "status": "low_evidence", "candidate_count": len(fused),
                        "dense_evidence": round(float(max_dense), 4),
                        "orthographic_support": round(orthographic_support, 4),
                        "orthographic_floor": round(
                            self._orthographic_ood_floor, 4),
                    }}

        required_scores = self._attribute_match_scores(required)
        excluded_scores = self._attribute_match_scores(excluded)
        hours_all = [self._hours_score(p, e, moment)[0] for p in self.pois]
        structured_cap = min(n_docs, max(top_k * 4, int(math.sqrt(n_docs) * 2)))
        structured = self._structured_union(
            # A soft category can safely contribute bounded candidate recall;
            # it is not a hard filter and creates no violation tier below.
            location_entities, required_scores, hours_all, structured_cap)
        candidates = {idx: (idx, vec, lex, _clip01(hyb))
                      for idx, vec, lex, hyb in fused}
        structured_union_count = 0
        for idx, relevance in structured:
            if idx not in candidates:
                candidates[idx] = (idx, 0.0, 0.0, relevance)
                structured_union_count += 1

        # A relational/contained category may still be useful relevance
        # evidence, but only a core category can create a violation tier or a
        # hard post-filter.  This keeps ``dia diem co nhieu nha hang`` broad
        # without throwing away the user's topical clue.
        wants_category = e.get("category")
        wants_name = core_name
        wants_brand = e.get("brand")
        category_is_constraint = bool(core_category)
        hours_constrained = bool(e.get("open_after") or e.get("open_late")
                                 or e.get("open_before") or e.get("open_24h")
                                 or e.get("open_now"))
        price_preference = bool(e.get("price_max") is not None
                                or e.get("price_level_max") is not None)

        active_weights = {"relevance": WEIGHTS["relevance"],
                          "rating": WEIGHTS["rating"],
                          "popularity": WEIGHTS["popularity"]}
        if wants_name:
            active_weights["name"] = WEIGHTS["name"]
        if wants_category:
            active_weights["category"] = WEIGHTS["category"]
        if required or excluded:
            active_weights["attributes"] = WEIGHTS["attributes"]
        if location_context["constrained"]:
            active_weights["location"] = WEIGHTS["location"]
        if hours_constrained:
            active_weights["hours"] = WEIGHTS["hours"]
        if wants_brand:
            active_weights["brand"] = WEIGHTS["brand"]
        if price_preference:
            active_weights["price"] = WEIGHTS["price"]
        weight_total = sum(active_weights.values()) or 1.0

        results: List[RankedResult] = []
        for idx, _, _, relevance in candidates.values():
            p = self.pois[idx]
            reasons: List[str] = []
            signals: Dict[str, float] = {"relevance": _clip01(relevance)}
            violations = unknowns = 0

            exact_name_match = False
            if wants_name:
                forms = {fold(p.name), fold(p.name_en),
                         *(fold(value) for value in p.aliases)}
                exact_name_match = id(p) in self._grounded_identity_members(
                    str(wants_name))
                signals["name"] = 1.0 if exact_name_match else 0.0
                if exact_name_match:
                    reasons.append("đúng địa điểm")

            if wants_category:
                if not p.category:
                    category_score, category_state = 0.5, None
                elif fold(p.category) == fold(wants_category):
                    category_score, category_state = 1.0, True
                    reasons.append(f"đúng loại {p.category}")
                else:
                    category_score, category_state = 0.0, False
                signals["category"] = category_score
                if category_is_constraint and category_state is False:
                    violations += 1
                elif category_is_constraint and category_state is None:
                    unknowns += 1

            if required:
                (positive_score, matched, attribute_violations,
                 attribute_unknowns) = self._positive_attribute_evidence(
                    idx, required, required_scores)
                violations += attribute_violations
                unknowns += attribute_unknowns
                if matched:
                    reasons.append("phù hợp: " + ", ".join(matched))
            else:
                positive_score = 0.5
            exclusion_violation = 0.0
            if excluded:
                if not bool(self._attribute_known[idx]):
                    exclusion_score = 0.5
                    unknowns += len(excluded)
                else:
                    exclusion_violation = float(excluded_scores[:, idx].max())
                    exclusion_score = 1.0 - exclusion_violation
                    if exclusion_violation >= 0.68:
                        violations += 1
            else:
                exclusion_score = 0.5
            if required or excluded:
                parts = ([positive_score] if required else []) \
                    + ([exclusion_score] if excluded else [])
                signals["attributes"] = sum(parts) / len(parts)
                signals["excluded_attributes"] = exclusion_score

            loc_score, loc_reasons, loc_state, distance, loc_constrained = \
                self._location_evidence(p, location_u, location_context)
            if loc_constrained:
                signals["location"] = loc_score
                reasons.extend(loc_reasons)
                if loc_state is False:
                    violations += 1
                elif loc_state is None:
                    unknowns += 1
                if distance is not None:
                    signals["distance"] = self._distance_relevance(
                        distance, location_context)

            hours_score, hours_reason, constrained = self._hours_score(p, e, moment)
            signals["hours"] = hours_score
            if constrained:
                if hours_reason:
                    reasons.append(hours_reason)
                if hours_score <= 0.01:
                    violations += 1
                elif 0.49 <= hours_score <= 0.51:
                    unknowns += 1

            if wants_brand:
                brand_hay = fold(" ".join([p.brand, p.name]))
                if not brand_hay:
                    brand_score, brand_state = 0.5, None
                elif fold(wants_brand) in brand_hay:
                    brand_score, brand_state = 1.0, True
                    reasons.append(f"đúng thương hiệu {wants_brand}")
                else:
                    brand_score, brand_state = 0.0, False
                signals["brand"] = brand_score
                if u.intent == "Brand Category Search" and brand_state is False:
                    violations += 1
                elif brand_state is None:
                    unknowns += 1

            if price_preference:
                if p.price_level is None:
                    price_score = 0.5
                    unknowns += 1
                else:
                    price_score = 1.0 - (min(4, max(1, p.price_level)) - 1) / 3.0
                    level_max = e.get("price_level_max")
                    if level_max is not None and p.price_level > float(level_max):
                        violations += 1
                signals["price"] = price_score

            signals["rating"] = self._bayesian_rating(p)
            signals["popularity"] = self._popularity(p)
            if p.rating and p.rating >= 4.3:
                reasons.append(f"đánh giá {p.rating}★")
            if signals["popularity"] >= 0.8:
                reasons.append("phổ biến")
            rating_min = e.get("rating_min")
            if rating_min is not None:
                if p.rating is None:
                    unknowns += 1
                elif p.rating < float(rating_min):
                    violations += 1

            if wants_name:
                if exact_name_match:
                    # Tokens such as ``24h`` can legitimately be part of a POI
                    # name.  Exact entity grounding takes precedence over
                    # constraints inferred from those identifying tokens, but
                    # never over a separately typed constraint after the name.
                    raw_is_only_name = fold(query) in forms
                    if raw_is_only_name:
                        violations = 0
                        unknowns = 0
                else:
                    violations += 1

            score = sum(weight * signals.get(name, 0.5)
                        for name, weight in active_weights.items()) / weight_total
            # Unknown evidence is retained and mildly discounted; known
            # violations are placed in later relaxation tiers and penalized.
            score *= 0.96 ** unknowns
            score *= 0.62 ** violations
            score = _clip01(score)
            results.append(RankedResult(
                p, score, self._dedupe(reasons)[:4], signals,
                violations=violations, unknowns=unknowns,
                location_state=loc_state if loc_constrained else None))

        # Known-constraint tiers implement controlled relaxation.  Within a
        # tier, stable calibrated score and corpus order determine rank.
        results.sort(key=lambda result: (
            result.violations, result.unknowns, -result.score,
            -result.signals.get("relevance", 0.0), result.poi.name))

        pre_filter_count = len(results)
        if core_name:
            results = [
                result for result in results
                if id(result.poi) in self._grounded_identity_members(core_name)
            ]
        if core_category:
            expected_category = fold(core_category)
            results = [
                result for result in results
                if fold(result.poi.category) == expected_category
            ]
        if core_brand:
            expected_brand = fold(core_brand)
            results = [
                result for result in results
                if expected_brand in fold(" ".join(
                    (result.poi.brand, result.poi.name)))
            ]
        specialization = e.get("sub_category") or e.get("dish")
        specialization_unknowns = 0
        if specialization:
            states = [
                (result, self._specialization_state(
                    result.poi, specialization, wants_category))
                for result in results
            ]
            specialization_unknowns = sum(state is None for _, state in states)
            results = [result for result, state in states if state is True]
        if (core_name or core_category) and not results and not specialization:
            return {
                **base_response,
                "results": [],
                "diagnostics": {
                    "status": "no_matches", "candidate_count": 0,
                    "pre_filter_candidate_count": pre_filter_count,
                    "strict_candidate_count": 0,
                    "reason": ("entity_not_retrieved" if core_name
                               else "no_strict_category_candidates"),
                    "hard_location": hard_location,
                    "location_source": location_context.get("source"),
                },
            }
        if specialization and not results:
            return {
                **base_response,
                "results": [],
                "diagnostics": {
                    "status": "no_matches", "candidate_count": 0,
                    "pre_filter_candidate_count": pre_filter_count,
                    "strict_candidate_count": 0,
                    "specialization_unknown_candidate_count":
                        specialization_unknowns,
                    "reason": "no_strict_specialization_candidates",
                    "hard_location": hard_location,
                    "location_source": location_context.get("source"),
                },
            }
        if hard_location:
            # A relaxed attribute/category can still be useful, but a result in
            # the wrong city or outside the requested reference radius cannot.
            results = [result for result in results
                       if result.location_state is True]
            if not results:
                return {
                    **base_response,
                    "results": [],
                    "diagnostics": {
                        "status": "no_matches", "candidate_count": 0,
                        "pre_filter_candidate_count": pre_filter_count,
                        "strict_candidate_count": 0,
                        "reason": "no_strict_location_candidates",
                        "hard_location": hard_location,
                        "location_source": location_context.get("source"),
                    },
                }

        # Multiple sources can describe the same physical place, while separate
        # branches can legitimately share a name.
        results, duplicate_count = self._deduplicate_ranked(results)
        results, diversified_count = self._diversify_generic_results(results, u)

        strict_count = sum(result.violations == 0 and result.unknowns == 0
                           for result in results)
        unknown_count = sum(result.violations == 0 and result.unknowns > 0
                            for result in results)
        returned_count = min(top_k, len(results))
        status = "ok" if strict_count >= returned_count else "constraints_relaxed"
        diagnostics = {
            "status": status,
            "candidate_count": len(results),
            "pre_filter_candidate_count": pre_filter_count,
            "deduplicated_count": duplicate_count,
            "diversified_count": diversified_count,
            "retrieved_count": len(fused),
            "structured_union_count": structured_union_count,
            "strict_candidate_count": strict_count,
            "unknown_candidate_count": unknown_count,
            "specialization_unknown_candidate_count": specialization_unknowns,
            "rank_window": rank_window,
            "query_view_count": len(views),
            "location_source": location_context.get("source"),
            "hard_location": hard_location,
        }
        payload = self._ranked_payload(results, top_k)
        return {
            **base_response,
            "results": payload,
            "diagnostics": diagnostics,
        }
