"""P6 — Vietnamese query understanding.

Pipeline: normalize -> exact spans -> guarded live-corpus first-word grounding
-> type-aware abbreviation expansion -> span-based entity linking (restores
accents, fixes typos, grounds entities in the KB) -> intent classification ->
normalized-query reconstruction -> confidence.

Deterministic and offline by default. An optional OpenRouter LLM boost
(tascomaps.llm) can refine intent/entities for hard queries and degrades
gracefully to this result when unavailable.
"""
from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from typing import Dict, List, Optional, Tuple

from rapidfuzz import fuzz

from ..constants import (ADJECTIVE_STOP, ATTRIBUTE_TERMS, CATEGORY_QUERY_TERMS,
                         canon_city, CITY_CANON, FACILITY_CATEGORIES,
                         LANDMARK_CATEGORIES, STOPWORDS)
from ..data.kb import KnowledgeBase
from .text import (accent_prefix_compatible, fold, has_accents, normalize,
                   parse_coordinates, title_vi, tokenize)

_CURRENT_LOC = ["gần đây", "gần tôi", "gần nhất", "gần nhà", "quanh đây",
                "gần chỗ tôi", "near me", "nearby", "gần mình", "gần tui",
                "quanh tui", "gần chỗ tui", "ở đây", "quanh chỗ này"]
_LOCAL_PRONOUNS = {"đây", "tôi", "mình", "tui", "day", "toi", "nhat"}
_SENTENCE_PARTICLES = {"hông", "hong", "không", "khong", "ha", "hả", "nha",
                       "nhé", "nhe", "vậy", "vay", "ạ", "a"}
_NEAR_PREP = ["gần", "near", "quanh", "cạnh", "kế bên", "xung quanh", "around"]
_NAV_MARKERS = ["chỉ đường", "chi duong", "đường đi", "đường tới", "đường đến",
                "dẫn đường", "lộ trình", "directions", "navigate", "how to get"]
_DISCOVERY_HEADS = ["địa điểm", "hẹn hò", "nơi ", "chỗ ", "nơi phù hợp",
                    "chỗ vui chơi", "place for", "địa diem"]
_PRICE_RE = re.compile(
    r"(?:dưới|duoi|under|<|tối\s*đa|toi\s*da|"
    r"không\s*quá|khong\s*qua|rẻ\s*hơn|re\s*hon)\s*"
    r"(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*"
    r"(k|nghìn|nghin|ngàn|ngan|triệu|trieu|tr|million|000đ|000d|đ|d|vnd|000)?", re.I)
_LATE_RE = re.compile(
    r"mở cửa muộn|mo cua muon|mở cửa khuya|mo cua khuya|mở khuya|mo khuya|open late|"
    r"ăn đêm|an dem|mở cửa sau|mo cua sau|còn mở khuya|con mo khuya", re.I)
_HOUSE_NUMBER_RE = re.compile(
    r"(?:^|\b(?:địa\s*chỉ|dia\s*chi|số|so)\s+)"
    r"(\d+[a-z]?(?:/\d+[a-z]?)?)\b", re.I)
_TIME_VALUE = (
    r"(?P<hour>\d{1,2})(?::(?P<minute>\d{2}))?\s*"
    r"(?:h|giờ|gio)?\s*"
    r"(?P<period>sáng|sang|trưa|trua|chiều|chieu|tối|toi|khuya|am|pm)?")
_OPEN_BOUND_RE = re.compile(
    rf"(?P<relation>sau|after|trước|truoc|before)\s*{_TIME_VALUE}", re.I)
_TIME_RANGE_RE = re.compile(
    r"\b(?:từ|tu|from)\s+\d{1,2}(?::\d{2})?\s*(?:h|giờ|gio|am|pm)?\s*"
    r"(?:đến|den|tới|toi|to)\s+\d{1,2}(?::\d{2})?\s*"
    r"(?:h|giờ|gio|am|pm)?\b", re.I)
_NEGATION_TAIL_RE = re.compile(
    r"(?:^|\s)(?:khong|ko|k|chang|tranh|without|no)"
    r"(?:\s+(?:can|co|muon))?\s*$", re.I)
_DISH_BOUNDARY_TOKENS = {
    "gan", "near", "quanh", "tai", "o", "co", "khong", "va", "cho",
    "duoi", "under", "sau", "after", "truoc", "before", "mo", "open",
    "tu", "from", "den", "to", "gia", "rating",
}
_NAMED_FACILITY_CACHE: Dict[Tuple[int, str], bool] = {}


@dataclass
class QueryUnderstanding:
    raw: str
    normalized_query: str
    intent: str
    entities: Dict = field(default_factory=dict)
    confidence: float = 0.0
    source: str = "deterministic"
    debug: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = asdict(self)
        d.pop("debug", None)
        return d


@dataclass
class Span:
    start: int
    end: int
    type: str
    canonical: str
    payload: Optional[str] = None


@dataclass(frozen=True)
class _PrefixGrounding:
    """A unique live-corpus entity progressively matched from token zero."""

    kind: str
    canonical: str
    payload: Optional[str]
    surface: str
    consumed_tokens: int


_TYPE_PRIORITY = {"poi": 6, "alias": 5, "district": 4, "city": 4,
                  "brand": 4, "street": 3, "ward": 2, "category": 1}


def _accent_safe_contains(text: str, term: str) -> bool:
    """Accent-insensitive phrase match without collapsing accented minimal pairs.

    Accentless input such as ``pho ga`` may match ``phở gà``. If the user
    supplied accents, however, they must agree with the canonical term, so
    ``phố`` cannot silently become ``phở`` and ``gà`` cannot become ``ga``.
    """
    source = tokenize(text)
    target = tokenize(term)
    if not source or not target or len(target) > len(source):
        return False
    target_fold = [fold(t) for t in target]
    for i in range(len(source) - len(target) + 1):
        window = source[i:i + len(target)]
        if [fold(t) for t in window] != target_fold:
            continue
        if all(not has_accents(src)
               or (len(fold(src)) == len(fold(dst))
                   and accent_prefix_compatible(src, dst))
               for src, dst in zip(window, target)):
            return True
    return False


# --------------------------------------------------------------------------
def _apply_abbrev(tokens: List[str], kb: KnowledgeBase,
                  protected: Optional[List[bool]] = None):
    """Type-aware abbreviation handling.

    Place-type abbreviations (district/city/category/brand/poi/street) are
    substituted with their canonical expansion. Intent/nearby markers set
    hints instead of mangling the text. Returns the expanded token list plus
    typed hints.
    """
    out: List[str] = []
    kinds: List[Optional[str]] = []       # per output token: place-kind or None
    hits: Dict[str, str] = {}
    ent: Dict[str, str] = {}              # kind -> canonical value
    attrs: List[str] = []
    intent_hint = None
    current_loc = False
    place_kinds = {"district", "city", "category", "brand", "poi", "street",
                   "area", "alias"}
    protected = protected or [False] * len(tokens)
    i = 0
    while i < len(tokens):
        # An exact POI/alias span has stronger evidence than a generic token
        # inside its name.  For example, Coffee in "Highlands Coffee Lê Duẩn"
        # must not be destructively expanded into a category.
        if i < len(protected) and protected[i]:
            out.append(tokens[i])
            kinds.append("protected")
            i += 1
            continue
        matched = None
        for n in (3, 2, 1):
            if i + n > len(tokens):
                continue
            if any(protected[i:i + n]):
                continue
            key = fold(" ".join(tokens[i:i + n]))
            if key in kb.abbrev:
                entry = kb.abbrev[key]
                surface = " ".join(tokens[i:i + n])
                # A folded abbreviation must not override explicit Vietnamese
                # accents (e.g. gà -> ga / nhà ga).
                accented_abbreviation = len(surface) <= 3 and "đ" in surface.lower()
                if has_accents(surface) and normalize(surface) != normalize(entry.abbr) \
                        and not accented_abbreviation:
                    continue
                matched = (entry, n)
                break
        if not matched:
            out.append(tokens[i])
            kinds.append(None)
            i += 1
            continue
        e, n = matched
        hits[e.abbr] = e.expansion
        if e.type in place_kinds:
            parts = e.expansion.split()
            if e.type == "category" and out:
                expansion_fold = fold(e.expansion)
                # Avoid duplicating a generic head immediately before its
                # expansion ("quán cafe" -> "Quán cà phê", not
                # "quán Quán cà phê").
                for prefix_size in range(min(2, len(out)), 0, -1):
                    prefix = fold(" ".join(out[-prefix_size:]))
                    if prefix and expansion_fold.startswith(prefix + " "):
                        del out[-prefix_size:]
                        del kinds[-prefix_size:]
                        break
            for p in parts:
                out.append(p)
                kinds.append(e.type)
            ent.setdefault(e.type, e.expansion)
        elif e.type == "amenity" or e.type == "attribute":
            attrs.append(e.expansion)
            for p in e.expansion.split():
                out.append(p)
                kinds.append(None)
        elif e.type == "intent":
            intent_hint = "Navigation"
            for j in range(n):
                out.append(tokens[i + j])
                kinds.append("navword")
        elif e.type == "nearby":
            current_loc = True
            for j in range(n):
                out.append(tokens[i + j])
                kinds.append(None)
        elif e.type in ("opening", "preposition"):
            for p in e.expansion.split():
                out.append(p)
                kinds.append(None)
        else:  # synonym: keep surface form
            for j in range(n):
                out.append(tokens[i + j])
                kinds.append(None)
        i += n
    return out, kinds, hits, ent, attrs, intent_hint, current_loc


def _link_spans(tokens: List[str], kb: KnowledgeBase,
                max_n: Optional[int] = None) -> List[Span]:
    spans: List[Span] = []
    covered = [False] * len(tokens)
    max_n = max_n or kb.lexicon.max_tokens
    for n in range(min(max_n, len(tokens)), 0, -1):
        for i in range(0, len(tokens) - n + 1):
            if any(covered[i:i + n]):
                continue
            surface = " ".join(tokens[i:i + n])
            key = fold(surface)
            hits = kb.lexicon.exact(key)
            hits = [h for h in hits if _accent_safe_contains(surface, h.canonical)]
            if not hits:
                continue
            best = max(hits, key=lambda e: (_TYPE_PRIORITY.get(e.type, 0), e.weight))
            spans.append(Span(i, i + n, best.type, best.canonical, best.payload))
            for j in range(i, i + n):
                covered[j] = True
    spans.sort(key=lambda s: s.start)
    return spans


def _restore_token(tok: str, kb: KnowledgeBase) -> str:
    if has_accents(tok):
        return tok
    ft = fold(tok)
    if ft in kb.token_vocab:
        return kb.token_vocab[ft]
    if len(ft) >= 4:
        h = kb.lexicon.fuzzy(ft, limit=1, score_cutoff=91.0)
        if h and " " not in h[0][0].fold:
            return h[0][0].canonical.lower()
    return tok


def _detect_category(text: str, kb: KnowledgeBase) -> Optional[str]:
    matches = []
    qfold = fold(text)
    terms = kb.category_terms or CATEGORY_QUERY_TERMS
    for term, canon in terms.items():
        ft = fold(term)
        if not ft or not _accent_safe_contains(text, term):
            continue
        match = re.search(r"(?<!\w)" + re.escape(ft) + r"(?!\w)", qfold)
        if match:
            matches.append((match.start(), match.end(), len(ft), canon))
    if not matches:
        # Recover a conservative single-edit category phrase.  The entire
        # remaining category text must have the same token count, a very high
        # character score, and a unique canonical winner.  This is typo
        # recovery, not a free-form category guess.
        query_tokens = tokenize(text)
        query_fold = fold(text)
        accent_chars = {
            char for char in normalize(text)
            if char.isalpha() and has_accents(char)
        }
        fuzzy_by_canonical: Dict[str, float] = {}
        for term, canon in terms.items():
            term_tokens = tokenize(term)
            term_fold = fold(term)
            if (not query_fold or len(query_tokens) != len(term_tokens)
                    or query_fold == term_fold):
                continue
            if accent_chars and not accent_chars.issubset(set(normalize(term))):
                continue
            score = fuzz.ratio(query_fold, term_fold)
            if score >= 92.0:
                fuzzy_by_canonical[canon] = max(
                    score, fuzzy_by_canonical.get(canon, 0.0))
        ordered = sorted(
            fuzzy_by_canonical.items(), key=lambda item: (-item[1], fold(item[0])))
        if ordered and (len(ordered) == 1 or ordered[0][1] >= ordered[1][1] + 3.0):
            return ordered[0][0]
        return None

    # Longest phrase remains the normal winner.  A requested type at the head
    # of the query, however, owns the search when a later type occurs in a
    # containment/proximity clause (``khach san co cafe``, ``cafe gan cho``).
    # This is structural rather than category-specific and also works for new
    # categories learned from the workbooks.
    longest = max(matches, key=lambda item: (item[2], -item[0]))
    ordered = sorted(matches, key=lambda item: (item[0], -item[2]))
    head_fillers = {
        "tim", "kiem", "cho", "toi", "minh", "muon", "can", "hay",
        "giup", "please", "find", "search",
    }
    relation = re.compile(
        r"(?:^|\s)(?:co|khong(?:\s+co)?|gan|quanh|canh|ke\s+ben|"
        r"voi|kem|gom|nhieu|trong|inside|with|near|around)(?:\s|$)")
    for head in ordered:
        prefix_tokens = qfold[:head[0]].strip().split()
        if any(token not in head_fillers for token in prefix_tokens):
            continue
        for later in ordered:
            if later[0] < head[1] or fold(later[3]) == fold(head[3]):
                continue
            if relation.search(qfold[head[1]:later[0]]):
                return head[3]
    return longest[3]


def _supports_named_facility_tail(category: Optional[str],
                                  kb: KnowledgeBase) -> bool:
    """Infer whether ``<category> <name>`` commonly identifies one facility.

    The static seed covers well-known singleton place types.  New workbook
    categories qualify when most live names in that category actually begin
    with the category phrase, which adds hospitals/pharmacies without turning
    every descriptive cafe or restaurant query into a fabricated POI.
    """
    if not category:
        return False
    if category in FACILITY_CATEGORIES:
        return True
    category_fold = fold(category)
    cache_key = (id(kb), category_fold)
    cached = _NAMED_FACILITY_CACHE.get(cache_key)
    if cached is not None:
        return cached
    members = [poi for poi in kb.pois
               if fold(poi.category) == category_fold and poi.name]
    if not members:
        return False
    prefixed = sum(
        fold(poi.name).startswith(category_fold + " ")
        or fold(poi.name).startswith("truong " + category_fold + " ")
        for poi in members)
    answer = prefixed * 2 >= len(members)
    if len(_NAMED_FACILITY_CACHE) >= 256:
        _NAMED_FACILITY_CACHE.clear()
    _NAMED_FACILITY_CACHE[cache_key] = answer
    return answer


def _detect_attributes(qfold: str, kb: KnowledgeBase,
                       category: Optional[str] = None,
                       identity_phrases: Optional[List[str]] = None) \
        -> Tuple[List[str], List[str]]:
    """Return positive and explicitly excluded attributes.

    Matching carries character offsets so a nearby negation can scope to the
    attribute instead of being discarded as a stopword. Attribute words fully
    contained inside a grounded category/brand/POI identity are ignored; the
    same words remain valid when explicitly typed outside that identity.
    """
    positive: List[str] = []
    excluded: List[str] = []
    terms = dict(kb.attribute_terms or ATTRIBUTE_TERMS)
    if category:
        category_fold = fold(category)
        for poi in kb.pois:
            if fold(poi.category) != category_fold:
                continue
            for attribute in poi.attributes:
                attribute_fold = fold(attribute)
                if re.search(r"(?<!\w)" + re.escape(attribute_fold)
                             + r"(?!\w)", category_fold):
                    continue
                terms.setdefault(fold(attribute), attribute)

    protected_ranges: List[Tuple[int, int]] = []
    protected_phrases = list(identity_phrases or [])
    if category:
        protected_phrases.append(category)
    for phrase in protected_phrases:
        phrase_fold = fold(phrase)
        if not phrase_fold:
            continue
        for match in re.finditer(
                r"(?<!\w)" + re.escape(phrase_fold) + r"(?!\w)", qfold):
            protected_ranges.append((match.start(), match.end()))

    matches = []
    for term, canon in terms.items():
        ft = fold(term)
        if not ft:
            continue
        for match in re.finditer(r"(?<!\w)" + re.escape(ft) + r"(?!\w)", qfold):
            if any(left <= match.start() and match.end() <= right
                   for left, right in protected_ranges):
                continue
            matches.append((match.start(), -(match.end() - match.start()), canon))
    # Prefer longer overlapping semantic phrases, then preserve query order.
    occupied: List[Tuple[int, int]] = []
    for start, negative_length, canon in sorted(matches):
        end = start - negative_length
        if any(not (end <= left or start >= right) for left, right in occupied):
            continue
        occupied.append((start, end))
        prefix = qfold[max(0, start - 36):start]
        target = excluded if _NEGATION_TAIL_RE.search(prefix) else positive
        if canon not in target:
            target.append(canon)
    # An explicit exclusion wins if the same attribute was also picked up from
    # a broader overlapping synonym.
    positive = [value for value in positive if value not in excluded]
    return positive, excluded


def _detect_city(qfold: str) -> Optional[str]:
    for term, canon in CITY_CANON.items():
        if re.search(r"\b" + re.escape(fold(term)) + r"\b", qfold):
            return canon
    return None


def _detect_dish(text: str, kb: KnowledgeBase) -> Tuple[
        Optional[str], Optional[str], Optional[int], Optional[int]]:
    """Detect exact corpus dishes and open compositional dish variants."""
    tokens = tokenize(text)
    if not tokens or not kb.dish_terms:
        return None, None, None, None
    folded_tokens = [fold(token) for token in tokens]
    candidates = []

    # Exact menu/sub-category phrases carry canonical accents and casing.
    for term, canonical in kb.dish_terms.items():
        target = [fold(token) for token in tokenize(term)]
        if not target or len(target) > len(tokens):
            continue
        for start in range(len(tokens) - len(target) + 1):
            end = start + len(target)
            surface = " ".join(tokens[start:end])
            if folded_tokens[start:end] == target \
                    and _accent_safe_contains(surface, term):
                category = kb.dish_categories.get(normalize(term), "Nhà hàng")
                candidates.append((len(target), 1, -start, canonical, category,
                                   start, end))

    # A head learned from an observed dish can accept a new contiguous
    # modifier: "phở" + "gà", "sushi" + "cá ngừ". Constraint,
    # attribute, quality, and location clauses terminate the composition.
    attribute_phrases = [fold(term).split() for term in kb.attribute_terms]
    adjective_phrases = [fold(term).split() for term in ADJECTIVE_STOP]
    head_phrases = sorted(kb.dish_heads.items(),
                          key=lambda item: -len(item[0].split()))
    for start in range(len(tokens)):
        for head_fold, head in head_phrases:
            head_tokens = head_fold.split()
            head_end = start + len(head_tokens)
            if folded_tokens[start:head_end] != head_tokens:
                continue
            surface = " ".join(tokens[start:head_end])
            if not _accent_safe_contains(surface, head):
                continue
            # A one-token, two-letter accentless head (ca/cá, bo/bò, mi/mì)
            # is too ambiguous for open composition. Exact registered dishes
            # and accented input remain supported, as do learned multiword heads.
            if len(head_tokens) == 1 and len(head_fold) < 3 \
                    and not has_accents(tokens[start]):
                continue
            end = head_end
            while end < len(tokens) and end - start < 5:
                next_fold = folded_tokens[end]
                if next_fold in _DISH_BOUNDARY_TOKENS:
                    break
                if any(folded_tokens[end:end + len(phrase)] == phrase
                       for phrase in attribute_phrases + adjective_phrases if phrase):
                    break
                end += 1
            modifier_folds = folded_tokens[head_end:end]
            # Open composition needs at least one modifier independently
            # observed in menu-derived dish vocabulary.  This keeps learned
            # heads productive (for example, a known protein plus a new
            # compound word) without interpreting arbitrary phrases such as
            # "bánh xe" or "nước rửa xe" as food.
            if modifier_folds and not any(
                    value in kb.dish_token_vocab for value in modifier_folds):
                continue
            modifiers = []
            for token in tokens[head_end:end]:
                ft = fold(token)
                restored = token if has_accents(token) \
                    else kb.dish_token_vocab.get(ft, token)
                modifiers.append(restored.lower())
            canonical = head + (" " + " ".join(modifiers) if modifiers else "")
            category = kb.dish_head_categories.get(head_fold, "Nhà hàng")
            candidates.append((end - start, 0, -start, canonical, category,
                               start, end))

    if not candidates:
        return None, None, None, None
    _, _, _, canonical, category, start, end = max(candidates)
    return canonical, category, start, end


def _parse_clock(hour: int, minute: int, period: str) -> Optional[str]:
    if hour > 23 or minute > 59:
        return None
    fp = fold(period or "")
    if fp in {"am", "sang"}:
        if hour > 12:
            return None
        hour = 0 if hour == 12 else hour
    elif fp in {"pm", "toi", "chieu"}:
        if hour > 12:
            return None
        if hour < 12:
            hour += 12
    elif fp == "trua":
        if hour > 12:
            return None
        if hour < 11:
            hour += 12
    elif fp == "khuya":
        if hour == 12:
            hour = 0
        elif 5 <= hour < 12:
            hour += 12
    return f"{hour:02d}:{minute:02d}"


def _parse_price(raw_value: str, unit: str) -> Optional[int]:
    """Parse decimal and grouped price forms without conflating the two."""
    raw_value = raw_value.strip()
    unit_fold = fold(unit or "")
    groups = re.split(r"[.,]", raw_value)
    if len(groups) > 1 and all(len(group) == 3 for group in groups[1:]):
        value = float("".join(groups))
    elif len(groups) == 2:
        try:
            value = float(groups[0] + "." + groups[1])
        except ValueError:
            return None
    else:
        try:
            value = float(raw_value)
        except ValueError:
            return None
    if unit_fold in {"k", "nghin", "ngan", "000", "000d"}:
        value *= 1_000
    elif unit_fold in {"trieu", "tr", "million"}:
        value *= 1_000_000
    elif not unit_fold and value < 1_000:
        # Vietnamese map-search shorthand commonly omits the k suffix.
        value *= 1_000
    return int(round(value))


def _parse_open_bounds(text: str) -> Tuple[Optional[str], Optional[str]]:
    after = before = None
    for match in _OPEN_BOUND_RE.finditer(text):
        value = _parse_clock(int(match.group("hour")),
                             int(match.group("minute") or 0),
                             match.group("period") or "")
        if not value:
            continue
        if fold(match.group("relation")) in {"sau", "after"}:
            after = value
        else:
            before = value
    return after, before


def _looks_like_time(value: str) -> bool:
    return bool(re.fullmatch(
        r"\s*\d{1,2}(?::\d{2})?\s*(?:h|gio|am|pm|sang|trua|chieu|toi|khuya)?\s*",
        fold(value)))


def _canonical_segment(value: str, kb: KnowledgeBase) -> Tuple[str, Optional[str]]:
    """Canonicalize one route endpoint without interpreting the full query."""
    value = normalize(value)
    folded_value = fold(value)
    prefix = re.match(
        r"^(?:chi duong|duong di|duong toi|duong den|dan duong|"
        r"navigate|directions|di)\s+", folded_value)
    if prefix:
        value = value[prefix.end():].strip()
        folded_value = fold(value)
    suffix = re.search(
        r"\s+(?:di the nao|nhu the nao|how to get there)$", folded_value)
    if suffix:
        value = value[:suffix.start()].strip()
    if not value:
        return "", None
    tokens = value.split()
    spans = _link_spans(tokens, kb)
    full = [span for span in spans if span.start == 0 and span.end == len(tokens)]
    if full:
        best = max(full, key=lambda span: (
            span.type in {"poi", "alias"}, span.end - span.start,
            _TYPE_PRIORITY.get(span.type, 0)))
        if best.type in {"poi", "alias"}:
            obj = kb.resolve(best.payload, best.canonical) if best.payload else None
            if obj:
                return obj.name, "poi"
            # A payload-less alias is an area/colloquial surface, not evidence
            # for a specific POI branch.
            detected_city = _detect_city(value)
            if detected_city:
                return detected_city, "city"
            return best.canonical, best.type
        if best.type == "category":
            return best.canonical, "category"
        return best.canonical, best.type
    fuzzy_poi = _fuzzy_full_poi(fold(value), kb, cutoff=84.0)
    if fuzzy_poi:
        return fuzzy_poi[0].name, "poi"

    # A category followed by an otherwise ungrounded proper-name tail is a
    # named route endpoint, not the bare category.  Preserve it for downstream
    # routing/geocoding rather than silently broadening ``benh vien Tu Du`` to
    # every hospital.  Conversely, a grounded admin/attribute tail keeps the
    # category interpretation (``san bay tai Da Nang``, ``cafe hoc bai``).
    leading_categories = [span for span in spans
                          if span.type == "category" and span.start == 0]
    if leading_categories:
        leading = max(leading_categories, key=lambda span: span.end)
        if leading.end < len(tokens):
            tail_kinds = _tail_semantic_kinds(tokens, kb, start=leading.end)
            if not tail_kinds:
                tail = " ".join(_restore_token(token, kb)
                                for token in tokens[leading.end:])
                return f"{leading.canonical} {title_vi(tail)}".strip(), "poi"

    place_covered = [False] * len(tokens)
    for span in spans:
        if span.type in {"poi", "alias", "brand", "city", "district",
                         "street", "ward"}:
            for index in range(span.start, span.end):
                place_covered[index] = True
    category_text = " ".join(
        token for index, token in enumerate(tokens) if not place_covered[index])
    category = _detect_category(category_text, kb)
    if category:
        return category, "category"
    detected_city = _detect_city(value)
    if detected_city:
        return detected_city, "city"
    non_identity = [span for span in spans
                    if span.type not in {"poi", "alias"}]
    if non_identity:
        best = max(non_identity, key=lambda span: (
            span.end - span.start, _TYPE_PRIORITY.get(span.type, 0)))
        return best.canonical, best.type
    return title_vi(" ".join(_restore_token(token, kb) for token in tokens)), None


def _parse_route(text: str, kb: KnowledgeBase) -> Optional[dict]:
    """Parse origin/destination segments before generic navigation rules."""
    surface = normalize(text)
    route_tokens = tokenize(surface)
    route_folds = [fold(token) for token in route_tokens]
    if not route_tokens:
        return None

    protected = set()
    for span in _link_spans(route_tokens, kb):
        if span.type in {"poi", "alias", "city", "district", "street", "ward"}:
            protected.update(range(span.start, span.end))

    prefix_patterns = (
        ("chi", "duong"), ("duong", "di"), ("duong", "toi"),
        ("duong", "den"), ("dan", "duong"), ("lo", "trinh"),
        ("navigate",), ("directions",), ("di",), ("duong",),
    )
    prefix_end = 0
    for pattern in prefix_patterns:
        if tuple(route_folds[:len(pattern)]) == pattern:
            prefix_end = len(pattern)
            break

    def is_origin_marker(token: str) -> bool:
        key = fold(token)
        return key == "from" or (key == "tu" and (
            not has_accents(token) or normalize(token) == "từ"))

    def is_destination_marker(token: str) -> bool:
        key = fold(token)
        if key == "to":
            return True
        if key == "den":
            return not has_accents(token) or normalize(token) == "đến"
        if key == "toi":
            # Do not collapse Vietnamese minimal pairs such as tôi/tối into
            # the motion preposition tới merely because their folds agree.
            return not has_accents(token) or normalize(token) == "tới"
        return False

    def is_valid_reverse_marker(index: int) -> bool:
        if (index in protected or index < prefix_end
                or not is_origin_marker(route_tokens[index])):
            return False
        tail = route_tokens[index + 1:]
        if not tail:
            return False
        _, tail_type = _canonical_segment(" ".join(tail), kb)
        return tail_type is not None or len(tail) >= 2

    # Split on a destination marker first.  This makes an internal ``Tu`` in
    # names such as Nam Tu Liem or Benh vien Tu Du ordinary endpoint text.  An
    # initial explicit ``tu/from`` is removed only after the whole origin has
    # been selected.
    delimiter = next((
        index for index in range(prefix_end, len(route_tokens))
        if is_destination_marker(route_tokens[index]) and index not in protected
    ), None)
    origin_raw = ""
    destination_raw = ""
    if delimiter is not None:
        left = route_tokens[prefix_end:delimiter]
        explicit_origin = bool(left and is_origin_marker(left[0]))
        if explicit_origin:
            left = left[1:]
        right = route_tokens[delimiter + 1:]
        if left and right and not prefix_end and not explicit_origin:
            # In free text, Vietnamese/English destination words are also
            # ordinary grammar (notably English infinitive ``to work``).
            # Route splitting therefore needs either an explicit navigation
            # head or an explicit ``tu/from`` origin marker.
            left = []
        if left and right:
            origin_raw = " ".join(left)
            destination_raw = " ".join(right)
            if (_looks_like_time(origin_raw)
                    and _looks_like_time(destination_raw)):
                return None
        elif prefix_end and right:
            # Destination-first route: ``chi duong den X tu Y`` / ``navigate
            # to X from Y``.  An ungrounded one-token tail is retained as part
            # of an unknown name, so ``Benh vien Tu Du`` is not split.
            reverse_marker = next((
                index for index in range(len(route_tokens) - 1, delimiter, -1)
                if is_valid_reverse_marker(index)
            ), None)
            if reverse_marker is not None:
                origin_raw = " ".join(route_tokens[reverse_marker + 1:])
                destination_raw = " ".join(
                    route_tokens[delimiter + 1:reverse_marker])
            else:
                # ``chi duong den X`` is destination-only navigation.
                destination_raw = " ".join(right)

    if not destination_raw:
        # Reverse natural order: ``di <destination> tu <origin>``.  Require
        # the tail to be a grounded place (or a multi-token named landmark),
        # preventing the ``Tu`` in an unknown two-word name from becoming a
        # route marker.
        reverse_marker = None
        for index in range(len(route_tokens) - 1, prefix_end - 1, -1):
            if is_valid_reverse_marker(index):
                reverse_marker = index
                break
        if reverse_marker is not None and prefix_end:
            destination_tokens = route_tokens[prefix_end:reverse_marker]
            if (destination_tokens
                    and is_destination_marker(destination_tokens[0])):
                destination_tokens = destination_tokens[1:]
            origin_raw = " ".join(route_tokens[reverse_marker + 1:])
            destination_raw = " ".join(destination_tokens)

    if not destination_raw:
        if not prefix_end:
            return None
        destination_tokens = route_tokens[prefix_end:]
        if destination_tokens and is_destination_marker(destination_tokens[0]):
            destination_tokens = destination_tokens[1:]
        destination_raw = " ".join(destination_tokens)

    origin, origin_type = _canonical_segment(origin_raw, kb) if origin_raw else ("", None)
    destination, destination_type = _canonical_segment(destination_raw, kb)
    if not destination:
        return None

    destination_tokens = tokenize(destination_raw)
    destination_spans = _link_spans(destination_tokens, kb)

    def scoped_admin(kind: str) -> Optional[str]:
        spans = [span for span in destination_spans if span.type == kind]
        if not spans:
            return None
        explicit = [
            span for span in spans
            if span.start > 0 and fold(destination_tokens[span.start - 1])
            in {"o", "tai", "in", "at"}
        ]
        return (explicit[-1] if explicit else spans[-1]).canonical

    return {
        "origin": origin,
        "origin_type": origin_type,
        "destination": destination,
        "destination_type": destination_type,
        "destination_city": scoped_admin("city"),
        "destination_district": scoped_admin("district"),
    }


def _trim_reference_tail(value: str, kb: KnowledgeBase) -> str:
    """Separate a landmark from following semantic constraint clauses.

    Attribute boundaries come from the loaded taxonomy/POI registry. Generic
    comparison, opening-hours, price, and rating grammar supplies boundaries
    for constraints that are not attributes themselves.
    """
    value = value.strip()
    boundaries: List[int] = []

    clause = re.search(
        r"\s+(?:co\b|khong(?:\s+co)?\b|phu\s+hop\b|de\b|voi\b|"
        r"mo\s+cua\b|dang\s+mo\b|con\s+mo\b|"
        r"gia\b|danh\s+gia\b|xep\s+hang\b|rating\b|"
        r"[1-5]\s*sao\b)", value)
    if clause:
        boundaries.append(clause.start())

    for term in kb.attribute_terms:
        ft = fold(term)
        if not ft:
            continue
        match = re.search(r"(?<!\w)" + re.escape(ft) + r"(?!\w)", value)
        protected_head = re.match(
            r"^(?:pho di bo|bai bien|ben xe|san bay)\b", value)
        if match and protected_head and match.start() < protected_head.end():
            continue
        # A term at the beginning can be part of the landmark itself (for
        # example "Biển Mỹ Khê"). Only terms following a non-empty place
        # prefix form a trailing constraint boundary.
        if match and value[:match.start()].strip():
            start = match.start()
            connector = re.search(
                r"(?:^|\s)(?:co|khong(?:\s+co)?|phu\s+hop)\s*$",
                value[:start])
            boundaries.append(connector.start() if connector else start)

    for parser in (_OPEN_BOUND_RE, _PRICE_RE):
        match = parser.search(value)
        if match and value[:match.start()].strip():
            # Include an immediately preceding "mở cửa" or "giá" in the
            # constraint rather than leaving it attached to the landmark.
            prefix = value[:match.start()]
            introducer = re.search(r"(?:^|\s)(?:mo\s+cua|gia)\s*$", prefix)
            boundaries.append(introducer.start() if introducer else match.start())

    return value[:min(boundaries)].strip() if boundaries else value


def _reference_relation_attribute(value: str, kb: KnowledgeBase) -> Optional[str]:
    """Map an unresolved generic reference to observed relational metadata."""
    tail = fold(value)
    tail = re.sub(r"^(?:khu|khu vuc|vung)\s+", "", tail).strip()
    if not tail:
        return None
    observed = {}
    for canonical in kb.attribute_terms.values():
        observed.setdefault(fold(canonical), canonical)
    for poi in kb.pois:
        for canonical in poi.attributes:
            observed.setdefault(fold(canonical), canonical)
    candidates = []
    for attribute_fold, canonical in observed.items():
        match = re.match(r"^gan\s+(.+)$", attribute_fold)
        if not match:
            continue
        relation = match.group(1)
        boundary_match = bool(re.search(
            r"(?<!\w)" + re.escape(relation) + r"(?!\w)", tail))
        head_match = relation.split()[0] == tail.split()[0]
        if boundary_match or head_match:
            candidates.append((boundary_match, len(relation.split()), canonical))
    return max(candidates, default=(False, 0, None))[2]


def _reference_address(value: str, kb: KnowledgeBase) -> Optional[str]:
    match = re.match(r"(?:so\s+)?(\d+[a-z]?(?:/\d+[a-z]?)?)\s+(.+)$", value)
    if not match:
        return None
    number, remainder = match.groups()
    # Require a recognized street or at least a plausible multi-token street
    # tail; this prevents arbitrary numeric constraints becoming addresses.
    street_hit = kb.lexicon.exact(fold(remainder), types={"street"})
    if street_hit:
        street = street_hit[0].canonical
    else:
        tokens = remainder.split()
        if len(tokens) < 2:
            return None
        street = title_vi(" ".join(_restore_token(token, kb) for token in tokens))
    return f"{number} {street}"


def _resolve_brand_district(kb, brand, district, city):
    """Find the specific POI for a brand within a district/city (POI Search)."""
    bf = fold(brand)
    cands = [p for p in kb.pois if p.brand and fold(p.brand) == bf]
    # prefer proper branded venues whose name starts with the brand
    starts = [p for p in cands if fold(p.name).startswith(bf)]
    cands = starts or cands
    if district:
        df = fold(district)
        cands = [p for p in cands if fold(p.district) == df]
    if city:
        cf = fold(city)
        cands = [p for p in cands if fold(p.city) == cf]
    if not cands:
        return None
    # Rank by reusable quality evidence, never by challenge/source identity.
    return sorted(cands, key=lambda p: (
        -(p.popularity_score or 0), -(p.review_count or 0),
        -(p.rating or 0), fold(p.name)))[0]


def _fuzzy_full_poi(qfold: str, kb: KnowledgeBase, cutoff: float = 88.0):
    """Match the whole query to a specific POI name (handles typos, word order).

    Deliberately strict so generic category phrases ('nhà hàng ngon hà nội')
    don't collapse onto an incidental POI name.
    """
    query_tokens = qfold.split()
    qn = len(query_tokens)
    if any(fold(term) == qfold for term in kb.category_terms):
        return None
    informative = [token for token in query_tokens if token not in STOPWORDS]
    if not informative:
        return None

    explicit_cities = {fold(canonical) for key, canonical in kb.cities.items()
                       if re.search(r"(?<!\w)" + re.escape(key) + r"(?!\w)", qfold)}
    explicit_districts = {fold(canonical) for key, canonical in kb.districts.items()
                          if key.startswith("quan ") and re.search(
                              r"(?<!\w)" + re.escape(key) + r"(?!\w)", qfold)}
    ranked = []
    for p in kb.pois:
        if explicit_cities and fold(p.city) not in explicit_cities:
            continue
        if explicit_districts and fold(p.district) not in explicit_districts:
            continue
        best_form_score = 0.0
        for form in [p.name, p.name_en, *p.aliases]:
            nf = fold(form)
            if not nf or abs(len(nf.split()) - qn) > 2:
                continue
            # ratio/token-sort tolerate small edits and word order, but unlike
            # token-set similarity they penalize unexplained extra tokens.
            score = max(fuzz.ratio(qfold, nf), fuzz.token_sort_ratio(qfold, nf))
            best_form_score = max(best_form_score, score)
        if best_form_score >= cutoff:
            ranked.append((best_form_score, p))
    ranked.sort(key=lambda item: -item[0])
    if ranked:
        best_score, best = ranked[0]
        second_score = next((score for score, poi in ranked[1:]
                             if poi.name != best.name), 0.0)
        # Ambiguous fuzzy matches should remain unresolved unless the best
        # candidate is near-exact.
        if best_score >= 96.0 or best_score - second_score >= 3.0:
            return best, best_score
    return None


def _progressive_surface_support(query_tokens: List[str], surface: str):
    """Measure a token-zero progressive match against one corpus surface."""
    target = tokenize(surface)
    if not query_tokens or not target:
        return None
    matched = 0
    typed_chars = 0
    for typed, expected in zip(query_tokens, target):
        typed_fold = fold(typed)
        expected_fold = fold(expected)
        if not typed_fold or not expected_fold.startswith(typed_fold):
            break
        if has_accents(typed) and not accent_prefix_compatible(
                typed, expected):
            break
        matched += 1
        typed_chars += len(typed_fold)
    if not matched:
        return None
    return matched, matched == len(target), typed_chars


def _tail_semantic_kinds(tokens: List[str], kb: KnowledgeBase,
                         start: int = 1) -> set:
    """Return grounded constraint kinds found after the progressive head."""
    tail_tokens = tokens[start:]
    if not tail_tokens:
        return set()
    tail = " ".join(tail_tokens)
    tail_fold = fold(tail)
    kinds = {
        span.type for span in _link_spans(tail_tokens, kb)
        if span.type in {"category", "district", "city", "street", "ward"}
    }
    allowed_abbrev = {
        "category", "district", "city", "street", "area",
        "amenity", "attribute", "nearby", "opening", "intent",
    }
    for start in range(len(tail_tokens)):
        for size in (3, 2, 1):
            if start + size > len(tail_tokens):
                continue
            entry = kb.abbrev.get(fold(" ".join(
                tail_tokens[start:start + size])))
            if entry and entry.type in allowed_abbrev:
                kinds.add(entry.type)
    if _detect_category(tail, kb):
        kinds.add("category")
    positive, excluded = _detect_attributes(tail_fold, kb)
    if positive or excluded:
        kinds.add("attribute")
    dish, _, _, _ = _detect_dish(tail, kb)
    if dish:
        kinds.add("dish")
    if any(fold(marker) in tail_fold for marker in _CURRENT_LOC):
        kinds.add("nearby")
    if (_PRICE_RE.search(tail) or _OPEN_BOUND_RE.search(tail)
            or _LATE_RE.search(tail) or re.search(r"\b24/?7\b|\b24h\b", tail_fold)):
        kinds.add("constraint")
    return kinds


def _entity_prefix_hint(tokens: List[str], kb: KnowledgeBase) \
        -> Optional[_PrefixGrounding]:
    """Resolve a conservative progressive entity prefix from the live KB.

    The hint is not an implicit abbreviation. It requires phrase continuation
    or an independently grounded tail constraint, and it abstains whenever the
    best corpus identity is not unique.
    """
    if len(tokens) < 2:
        return None
    head = fold(tokens[0])
    if len(head) < 2 or not head.isalpha() or head in kb.abbrev:
        return None
    # A registered multi-token abbreviation remains authoritative even when
    # only its first token is absent from the dictionary (for example a live
    # two-word intent phrase).
    for size in (3, 2):
        if len(tokens) >= size \
                and fold(" ".join(tokens[:size])) in kb.abbrev:
            return None
    generic_head = head in STOPWORDS

    candidates = []
    allowed_types = {"category", "brand", "poi", "alias",
                     "city", "district", "street"}
    for entry in kb.lexicon.first_token_prefix(
            tokens[0], types=allowed_types, limit=128):
        kind = entry.type
        canonical = entry.canonical
        payload = entry.payload
        poi_category = ""
        if kind == "alias":
            alias_fold = fold(canonical)
            matching_brands = sorted({
                brand for brand in kb.brands.values()
                if fold(brand).startswith(alias_fold)
            }, key=fold)
            if len(matching_brands) == 1:
                kind = "brand"
                canonical = matching_brands[0]
                payload = None
            else:
                resolved = kb.resolve(payload, canonical) if payload else None
                if not resolved:
                    continue
                kind = "poi"
                canonical = resolved.name
                payload = resolved.poi_id
                poi_category = resolved.category
        elif kind == "poi":
            resolved = kb.resolve(payload, canonical) if payload else None
            if resolved:
                poi_category = resolved.category
            else:
                # Typed dictionaries can contribute a POI expansion without a
                # payload.  Recover only its unambiguous live category so the
                # generic category portion cannot masquerade as a completed
                # POI prefix (for example ``ben xe <unseen attribute>``).
                exact = [
                    poi for poi in kb.pois
                    if fold(canonical) in {
                        fold(value) for value in
                        (poi.name, poi.name_en, *poi.aliases) if value
                    }
                ]
                categories = {fold(poi.category): poi.category
                              for poi in exact if poi.category}
                if len(categories) == 1:
                    poi_category = next(iter(categories.values()))
        support = _progressive_surface_support(tokens, entry.canonical)
        if support:
            identity_floor = 0
            if kind == "poi" and poi_category:
                surface_tokens = fold(entry.canonical).split()
                category_tokens = fold(poi_category).split()
                for start in range(
                        max(0, len(surface_tokens) - len(category_tokens) + 1)):
                    if surface_tokens[start:start + len(category_tokens)] \
                            == category_tokens:
                        identity_floor = start + len(category_tokens)
                        break
            elif kind == "brand":
                surface_tokens = fold(entry.canonical).split()
                category_prefixes = {
                    tuple(fold(value).split())
                    for value in kb.category_terms.values() if fold(value)
                }
                identity_floor = max(
                    (len(prefix) for prefix in category_prefixes
                     if tuple(surface_tokens[:len(prefix)]) == prefix),
                    default=0)
            candidates.append((kind, canonical, payload, entry.canonical,
                               entry.weight, identity_floor, *support))

    # A user may omit a generic word before the canonical category portion of
    # a POI name (for example typing ``<category> <proper-name prefix>`` while
    # the catalog name starts with ``<facility word> <category> ...``). Anchor
    # at the live POI category and still require a distinctive token beyond it.
    folded_typed = [fold(token) for token in tokens]
    for poi in kb.pois:
        category_tokens = fold(poi.category).split()
        if (not category_tokens
                or folded_typed[:len(category_tokens)] != category_tokens):
            continue
        name_tokens = tokenize(poi.name)
        folded_name = [fold(token) for token in name_tokens]
        for start in range(len(name_tokens) - len(category_tokens) + 1):
            if folded_name[start:start + len(category_tokens)] != category_tokens:
                continue
            surface = " ".join(name_tokens[start:])
            support = _progressive_surface_support(tokens, surface)
            if support:
                candidates.append((
                    "poi", poi.name, poi.poi_id, surface, 1.0,
                    len(category_tokens), *support))
            break

    # Category registries include live sub-category/query surfaces that need
    # not be materialized as standalone lexicon entries.
    for surface, canonical in kb.category_terms.items():
        support = _progressive_surface_support(tokens, surface)
        if support:
            candidates.append(("category", canonical, None, surface,
                               0.5, 0, *support))

    eligible = []
    # Most candidates consume one of only a few distinct token offsets.  Cache
    # the grounded tail analysis per offset instead of reparsing the same tail
    # for every live lexicon candidate.
    tail_kinds_by_start = {}
    family_priority = {
        "category": 4, "brand": 4, "city": 3,
        "district": 3, "street": 2, "poi": 1,
    }
    for (kind, canonical, payload, surface, weight, identity_floor,
         matched, complete, typed_chars) in candidates:
        if kind in {"poi", "brand"} and identity_floor \
                and matched <= identity_floor:
            continue
        if matched not in tail_kinds_by_start:
            tail_kinds_by_start[matched] = _tail_semantic_kinds(
                tokens, kb, start=matched)
        tail_kinds = tail_kinds_by_start[matched]
        independent_tail = tail_kinds - {kind, "brand", "poi"}
        if (kind == "category" and complete and matched < len(tokens)
                and not independent_tail):
            continue
        progressive_evidence = matched >= 2 and typed_chars >= 4
        constrained_head = not generic_head and len(head) >= 4 \
            and bool(independent_tail)
        if not (progressive_evidence or constrained_head):
            continue
        eligible.append({
            "kind": kind,
            "canonical": canonical,
            "payload": payload,
            "surface": surface,
            "weight": weight,
            "matched": matched,
            "complete": bool(complete),
            "typed_chars": typed_chars,
            "family_priority": family_priority.get(kind, 0),
        })
    if not eligible:
        return None

    # Completion/progressive coverage is evidence; corpus popularity is not a
    # license to break a tie between different identities.
    best_support = max((int(row["complete"]), row["matched"],
                        row["typed_chars"]) for row in eligible)
    if best_support[1] == 1:
        # A lone first word must identify one family across every matching
        # surface. Do not let a short generic alias beat longer categories
        # merely because that alias is itself a complete one-token phrase.
        finalists = [row for row in eligible if row["matched"] == 1]
    else:
        finalists = [row for row in eligible
                     if (int(row["complete"]), row["matched"],
                         row["typed_chars"]) == best_support]
    best_family = max(row["family_priority"] for row in finalists)
    finalists = [row for row in finalists
                 if row["family_priority"] == best_family]

    identities = {}
    for row in finalists:
        signature = (row["kind"], fold(row["canonical"]))
        current = identities.get(signature)
        if current is None or row["weight"] > current["weight"]:
            identities[signature] = row
    if len(identities) != 1:
        return None
    winner = next(iter(identities.values()))
    return _PrefixGrounding(
        kind=winner["kind"], canonical=winner["canonical"],
        payload=winner["payload"], surface=winner["surface"],
        consumed_tokens=winner["matched"],
    )


def understand(query: str, kb: KnowledgeBase) -> QueryUnderstanding:
    raw = query
    stripped = query.strip()
    if not stripped or not tokenize(stripped):
        return QueryUnderstanding(
            raw=raw, normalized_query="", intent="Ambiguous",
            entities={"ambiguity_type": "empty_query"}, confidence=0.0)
    coords = parse_coordinates(stripped)
    if coords and len(stripped.split()) <= 2:
        return QueryUnderstanding(
            raw=raw, normalized_query=f"{coords[0]},{coords[1]}",
            intent="Coordinate Search",
            entities={"latitude": coords[0], "longitude": coords[1]}, confidence=0.99)

    tokens = tokenize(query)
    raw_spans = _link_spans(tokens, kb)
    _, _, raw_dish_start, raw_dish_end = _detect_dish(" ".join(tokens), kb)
    prefix_hint = None
    leading_spans = [span for span in raw_spans if span.start == 0]
    category_with_tail = bool(
        leading_spans and all(span.type == "category" for span in leading_spans)
        and len(tokens) > max(span.end for span in leading_spans))
    if (not leading_spans or category_with_tail) and raw_dish_start != 0:
        prefix_hint = _entity_prefix_hint(tokens, kb)
    raw_qfold = fold(" ".join(tokens))
    raw_has_specific_place = any(span.type in {"poi", "alias"}
                                 for span in raw_spans)
    raw_fuzzy_poi = None
    if not raw_has_specific_place and len(tokens) <= kb.lexicon.max_tokens + 2:
        raw_fuzzy_poi = _fuzzy_full_poi(raw_qfold, kb)
    protected = [False] * len(tokens)
    for span in raw_spans:
        if span.type in {"poi", "alias"}:
            surface_key = fold(" ".join(tokens[span.start:span.end]))
            abbreviation = kb.abbrev.get(surface_key)
            # A typed brand/category abbreviation such as VCB may also occur
            # as a noisy POI alias. Keep the typed dictionary interpretation;
            # otherwise an arbitrary branch would be selected too early.
            if abbreviation and abbreviation.type not in {"poi", "alias"}:
                continue
            for index in range(span.start, span.end):
                protected[index] = True
    if raw_dish_start is not None and raw_dish_end is not None:
        for index in range(raw_dish_start, raw_dish_end):
            protected[index] = True
    if prefix_hint:
        for index in range(min(prefix_hint.consumed_tokens, len(protected))):
            protected[index] = True
    (exp_tokens, kinds, abbrev_hits, abbr_ent, abbr_attrs,
     intent_hint, abbr_current_loc) = _apply_abbrev(tokens, kb, protected)
    if prefix_hint:
        canonical_tokens = tokenize(prefix_hint.canonical)
        consumed = prefix_hint.consumed_tokens
        exp_tokens = canonical_tokens + exp_tokens[consumed:]
        kinds = [prefix_hint.kind] * len(canonical_tokens) + kinds[consumed:]
    exp_norm = " ".join(exp_tokens)
    qfold = fold(exp_norm)
    spans = _link_spans(exp_tokens, kb)

    by_type: Dict[str, List[Span]] = {}
    for s in spans:
        by_type.setdefault(s.type, []).append(s)

    # place-covered tokens (for category masking): everything except category
    place_cov = [False] * len(exp_tokens)
    for s in spans:
        if s.type in ("poi", "alias", "brand", "district", "city", "street", "ward"):
            for j in range(s.start, s.end):
                if j < len(place_cov):
                    place_cov[j] = True
    for j, k in enumerate(kinds):
        if k in ("district", "city", "brand", "poi", "street", "area", "alias"):
            place_cov[j] = True

    # entities from spans + abbrev hints
    def _first(t):
        return by_type[t][0].canonical if t in by_type else None
    brand = abbr_ent.get("brand") or _first("brand")
    if brand and fold(brand) in ADJECTIVE_STOP:
        brand = None
    district = abbr_ent.get("district") or _first("district")
    street = abbr_ent.get("street") or _first("street")
    ward = _first("ward")
    # A non-overlapping linked city (commonly after "ở/tại") is explicit and
    # must beat a city token owned by a full POI name.
    explicit_city_spans = [
        span for span in by_type.get("city", [])
        if span.start > 0 and fold(exp_tokens[span.start - 1])
        in {"o", "tai", "in", "at"}
    ]
    city = (explicit_city_spans[-1].canonical if explicit_city_spans
            else abbr_ent.get("city") or _first("city") or _detect_city(qfold))
    # Emit one canonical city identity no matter which path produced it, so the
    # downstream hard location constraint in P7 compares like against like.
    if city:
        city = canon_city(city)
    if street and city and fold(street) == fold(city):
        street = None

    cat_raw = " ".join(t for j, t in enumerate(exp_tokens) if not place_cov[j])
    cat_text = fold(cat_raw)
    # Detect on the fully expanded surface first.  This preserves a requested
    # head category when a later related category arrived through an
    # abbreviation (``khach san co cf``, ``khach san gan bx``).  The typed
    # abbreviation remains the fallback when no structural mention exists.
    category = _detect_category(cat_raw, kb) or abbr_ent.get("category") \
        or ("category" in by_type and by_type["category"][0].canonical) or None

    attributes = []
    seen_attr = set()
    identity_phrases = [
        span.canonical for span in spans
        if span.type in {"poi", "alias", "brand", "category"}
    ]
    detected_attrs, excluded_attributes = _detect_attributes(
        qfold, kb, category, identity_phrases)
    excluded_folds = {fold(value) for value in excluded_attributes}
    for a in abbr_attrs + detected_attrs:
        c = "wifi" if fold(a).replace("-", "").replace(" ", "") == "wifi" else a
        if fold(c) not in seen_attr and fold(c) not in excluded_folds:
            seen_attr.add(fold(c))
            attributes.append(c)
    for match in re.finditer(r"\b([1-5])\s*sao\b", qfold):
        value = f"{match.group(1)} sao"
        if fold(value) not in seen_attr:
            seen_attr.add(fold(value))
            attributes.append(value)

    # Parking is normally an attribute ("cafe có bãi đỗ xe"), but becomes the
    # requested category when it is the query head.
    if not category and re.match(r"^(bai do xe|bai dau xe|cho dau xe)\b", qfold):
        category = "Bãi đỗ xe"
        attributes = [a for a in attributes if fold(a) != "bai do xe"]

    # POI span (exact) and its category — drop partial-brand aliases ('vietcom')
    brand_folds = set(kb.brands.keys())

    def _is_brand_fragment(sp):
        # an alias that *is* a brand, or a prefix of one, is a brand mention,
        # not a specific POI (e.g. 'vincom', 'vietcom').
        f = fold(sp.canonical)
        return sp.type == "alias" and (
            f in brand_folds or any(bf != f and bf.startswith(f) for bf in brand_folds))
    poi_cands = [
        span for span in (by_type.get("poi", []) + by_type.get("alias", []))
        if not _is_brand_fragment(span)
        and (span.type == "poi" or bool(
            span.payload and kb.resolve(span.payload, span.canonical)))
    ]
    poi_cands.sort(key=lambda s: (_TYPE_PRIORITY.get(s.type, 0)), reverse=True)
    poi_span = poi_cands[0] if poi_cands else None

    # recover a brand that was captured as a brand-equal alias span ('vincom')
    if not brand:
        for s in spans:
            bf = fold(s.canonical)
            if bf in brand_folds:
                brand = kb.brands.get(bf, s.canonical)
                break
    poi_obj = kb.resolve(poi_span.payload, poi_span.canonical) \
        if (poi_span and poi_span.payload) else None
    poi_name = (poi_obj.name if poi_span and poi_span.type == "alias" and poi_obj
                else poi_span.canonical if poi_span else None)
    _landmark_alias = bool(poi_span and poi_span.type == "alias" and
                           re.match(r"(hồ|cầu|chợ|sân bay|bến xe|phố|núi|biển)",
                                    poi_span.canonical.lower()))
    poi_is_landmark = bool(
        category and poi_span and (
            (poi_obj and poi_obj.category in LANDMARK_CATEGORIES
             and fold(poi_obj.category) != fold(category))
            or _landmark_alias))

    dish, dish_category, _, _ = _detect_dish(cat_raw, kb)
    if dish and not category:
        category = dish_category

    # modifiers
    price_max = None
    mp = _PRICE_RE.search(exp_norm)
    if mp:
        price_max = _parse_price(mp.group(1), mp.group(2) or "")
    open_after, open_before = _parse_open_bounds(exp_norm)
    open_late = bool(_LATE_RE.search(exp_norm)) \
        and fold("mở khuya") not in excluded_folds
    open_24h = bool(re.search(r"\b24/?7\b|\b24h\b", qfold)) \
        and fold("24/7") not in excluded_folds
    open_now = ("con mo" in qfold or "dang mo" in qfold or
                ("mo cua" in qfold and not open_after
                 and not open_before and not open_late))

    has_current_loc = abbr_current_loc or any(fold(m) in qfold for m in _CURRENT_LOC)
    # "trên đường đi X" is a route constraint, not a navigation request.
    route_context = bool(re.search(r"tren duong (di|toi|den)", qfold))
    time_range = bool(_TIME_RANGE_RE.search(exp_norm))
    parsed_route = None if route_context or time_range else _parse_route(exp_norm, kb)
    has_nav = not route_context and (
        parsed_route is not None
        or intent_hint == "Navigation"
        or any(fold(m) in qfold for m in _NAV_MARKERS)
        or (not time_range and (
            qfold.startswith("di ")
            or normalize(exp_norm).startswith(("tới ", "đến "))))
        or (not time_range and bool(
            re.search(r"\bden\b.*\btu\b|\btu\b.*\bden\b", qfold))))
    route_destination = None
    if route_context:
        mrd = re.search(r"tren duong (?:di|toi|den)\s+(.+)$", qfold)
        if mrd:
            route_destination, _ = _canonical_segment(mrd.group(1), kb)
    # discovery is checked on place-masked text so 'nội' (Hà Nội) != 'nơi'
    has_discovery = ("dia diem" in cat_text or "hen ho" in cat_text
                     or cat_text.startswith(("noi ", "cho "))
                     or "place for" in cat_text)

    # reference detection after a proximity preposition
    reference_poi = reference_area = reference_address = None
    ref_coords = None
    for prep in [fold(p) for p in _NEAR_PREP]:
        m = re.search(r"(?:^|\s)" + re.escape(prep) + r"\s+(.+)$", qfold)
        if not m:
            continue
        tail = _trim_reference_tail(m.group(1).strip(), kb)
        if not tail:
            break
        tail_tokens = fold(tail).split()
        while tail_tokens and tail_tokens[-1] in {
                fold(value) for value in _SENTENCE_PARTICLES}:
            tail_tokens.pop()
        if " ".join(tail_tokens) in {fold(value) for value in _LOCAL_PRONOUNS}:
            break
        tc = parse_coordinates(tail.replace(" ", ""))
        if tc:
            ref_coords = tc
            break
        address = _reference_address(tail, kb)
        if address:
            reference_address = address
            break
        # a bare city ('near da nang beach') is not a POI reference
        if fold(tail) in kb.cities or "beach" in tail:
            break
        if re.match(r"(bien|bai bien)\b", tail):
            after = re.sub(r"^(bien|bai bien)\s*", "", tail).strip()
            # only a *named* beach ('biển mỹ khê') is a reference area; a bare
            # 'gần biển' is just the attribute, already captured elsewhere.
            if after:
                if fold(after) in kb.cities:
                    break
                fh = kb.lexicon.fuzzy(after, types={"poi", "alias", "street"},
                                      limit=1, score_cutoff=82)
                if fh:
                    canonical = fh[0][0].canonical
                    reference_area = canonical if re.match(
                        r"^(biển|bãi biển)\b", canonical.lower()) else "Biển " + canonical
                else:
                    reference_area = "Biển " + title_vi(
                        " ".join(_restore_token(t, kb) for t in after.split()))
            break
        if re.match(r"(pho di bo|khu vuc)\b", tail):
            if tail.startswith("pho di bo"):
                rest = tail.split()[3:]
                suffix = title_vi(" ".join(_restore_token(t, kb) for t in rest))
                reference_area = "Phố đi bộ" + (f" {suffix}" if suffix else "")
            else:
                reference_area = title_vi(" ".join(_restore_token(t, kb)
                                                     for t in tail.split()))
            break
        exact_reference = kb.lexicon.exact(
            fold(tail), types={"poi", "alias", "street", "brand"})
        if not exact_reference:
            relation_attribute = _reference_relation_attribute(tail, kb)
            if relation_attribute:
                if fold(relation_attribute) not in {fold(value)
                                                     for value in attributes}:
                    attributes.append(relation_attribute)
                break
        fuzzy_reference = [] if exact_reference else kb.lexicon.fuzzy(
            tail, types={"poi", "alias", "street", "brand"},
            limit=1, score_cutoff=88)
        if exact_reference or fuzzy_reference:
            ref_entry = exact_reference[0] if exact_reference else fuzzy_reference[0][0]
            ref_object = kb.resolve(ref_entry.payload, ref_entry.canonical) \
                if ref_entry.payload else None
            reference_poi = ref_object.name if ref_object else ref_entry.canonical
            break
        # Preserve an unknown named landmark instead of hallucinating the
        # nearest fuzzy KB entry (e.g. Hồ Tây -> Hồ Hoàn Kiếm).
        reference_poi = title_vi(" ".join(_restore_token(t, kb)
                                            for t in tail.split()))
        break

    # Words inside a resolved address describe the location, not the requested
    # venue.  Keep an attribute only when it also appears before the proximity
    # clause (e.g. "khách sạn có wifi gần 12 Đường Trung Tâm").
    if reference_address:
        reference_fold = fold(reference_address)
        proximity = re.search(
            r"(?:^|\s)(?:" + "|".join(re.escape(fold(value))
                                      for value in _NEAR_PREP) + r")\s+", qfold)
        request_fold = qfold[:proximity.start()] if proximity else qfold

        def outside_reference(value: str) -> bool:
            value_fold = fold(value)
            return value_fold not in reference_fold or bool(re.search(
                r"(?<!\w)" + re.escape(value_fold) + r"(?!\w)", request_fold))

        attributes = [value for value in attributes if outside_reference(value)]
        excluded_attributes = [value for value in excluded_attributes
                               if outside_reference(value)]

    # Landmark-in-query without an explicit proximity preposition.
    if not reference_poi and poi_is_landmark and poi_name:
        reference_poi = poi_name
        poi_name = None
        poi_span = None

    # brand+district -> specific POI (no category) => POI Search
    resolved_poi = None
    if not poi_name and brand and (district or city) and not category:
        rp = _resolve_brand_district(kb, brand, district, city)
        if rp:
            resolved_poi = rp
            poi_name = rp.name

    # Whole-query fuzzy match to a specific POI (typos / word order).
    full_poi = None
    if not poi_span and not resolved_poi and not has_current_loc \
            and not reference_poi and not reference_area \
            and len(exp_tokens) <= kb.lexicon.max_tokens + 2:
        fp = raw_fuzzy_poi
        if not fp and not (brand and category):
            fp = _fuzzy_full_poi(qfold, kb)
        if fp:
            full_poi, _ = fp
            poi_name = full_poi.name
    if full_poi and poi_obj is None:
        poi_obj = full_poi

    # A facility category plus a proper noun can name a specific place even
    # when that place is absent from the POI DB.
    facility_poi = None
    if not poi_name and not has_nav \
            and _supports_named_facility_tail(category, kb) \
            and not reference_poi and not reference_area and not has_current_loc:
        semantic_values = [category, city, district, street, ward, brand, dish,
                           *attributes, *excluded_attributes]
        semantic_tokens = {
            token for value in semantic_values if value
            for token in fold(str(value)).split()
        }
        for surface, canonical in kb.category_terms.items():
            surface_fold = fold(surface)
            if (fold(canonical) == fold(category) and surface_fold
                    and re.search(r"(?<!\w)" + re.escape(surface_fold)
                                  + r"(?!\w)", qfold)):
                semantic_tokens.update(surface_fold.split())
        function_tokens = {fold(value) for value in STOPWORDS} | {
            "nha", "khong", "ko", "k", "can", "muon", "phu", "hop",
            "tim", "nao", "cac", "toi", "minh", "giup", "hay",
        }
        folded_exp_tokens = [fold(token) for token in exp_tokens]
        category_tokens = fold(category).split()
        category_end = 0
        for start in range(len(folded_exp_tokens) - len(category_tokens) + 1):
            if folded_exp_tokens[start:start + len(category_tokens)] \
                    == category_tokens:
                category_end = start + len(category_tokens)
                break
        extras = [
            (index, token) for index, token in enumerate(exp_tokens)
            if fold(token) not in semantic_tokens
            and fold(token) not in function_tokens
            and any(char.isalpha() for char in token)
        ]
        trailing_extras = [
            token for index, token in extras
            if not category_end or index >= category_end
        ]
        request_surfaces = {"tìm", "nào", "các", "cho", "tôi", "mình"}
        category_request = any(
            index >= category_end
            and fold(token) == fold(surface)
            and (not has_accents(token)
                 or normalize(token) == normalize(surface))
            for index, token in enumerate(exp_tokens)
            for surface in request_surfaces)
        has_nonidentity_constraint = bool(
            attributes or excluded_attributes or price_max
            or open_after or open_before or open_late or open_24h or open_now)
        # A named tail must follow an actually observed category surface.  A
        # whole-query typo recovered as a category (``Nha thuuoc``) has no such
        # boundary and must remain a category search, not an invented POI.
        facility_name_shape = bool(category_end and trailing_extras)
        if (facility_name_shape and not category_request
                and not has_nonidentity_constraint):
            # keep abbrev/place tokens verbatim (so 'Ga' isn't "restored" to 'Gà')
            # and capitalize only the restored proper-noun tokens.
            parts = []
            for i in range(len(exp_tokens)):
                if kinds[i]:
                    parts.append(exp_tokens[i])
                else:
                    r = _restore_token(exp_tokens[i], kb)
                    parts.append(r[:1].upper() + r[1:])
            if category_end:
                category_start = category_end - len(category_tokens)
                parts[category_start:category_end] = normalize(category).split()
            name_start = 0
            leading_requests = request_surfaces | {"hãy", "giúp", "please", "find"}
            while name_start < category_start and any(
                    fold(exp_tokens[name_start]) == fold(surface)
                    and (not has_accents(exp_tokens[name_start])
                         or normalize(exp_tokens[name_start]) == normalize(surface))
                    for surface in leading_requests):
                name_start += 1
            facility_poi = " ".join(parts[name_start:])
            poi_name = facility_poi

    # ambiguity: bare short brand/name with multiple branches
    ambiguous = None
    if len(exp_tokens) <= 2 and not district and not city and not has_current_loc \
            and not category and not reference_poi:
        surf = fold(exp_norm)
        base = surf
        matched = [p for p in kb.pois
                   if (p.brand and fold(p.brand) == base) or base in fold(p.name)]
        names, seen = [], set()
        for p in matched:
            if p.name not in seen:
                seen.add(p.name)
                names.append(p.name)
        cats = {p.category for p in matched}
        if len(names) >= 2 and len(cats) >= 1:
            display = title_vi(" ".join(_restore_token(t, kb) for t in exp_tokens))
            ambiguous = {
                "candidates": names[:4] or [display],
                "ambiguity_type": "brand_or_branch" if len(cats) < 2 else "brand_or_poi",
            }

    address_match = _HOUSE_NUMBER_RE.search(exp_norm)
    direct_address = bool(address_match and street and not reference_address)
    has_parse_evidence = bool(
        spans or abbrev_hits or category or dish or brand or district or city
        or poi_name or resolved_poi or full_poi or street or ward
        or attributes or excluded_attributes or has_current_loc
        or has_nav or has_discovery or reference_poi or reference_area
        or reference_address or ref_coords or direct_address or price_max
        or open_after or open_before or open_late or open_24h or open_now)
    if not ambiguous and not has_parse_evidence:
        ambiguous = {"candidates": [], "ambiguity_type": "no_match"}

    # ---- intent classification -----------------------------------------
    intent = "POI Search"
    has_ref_constraints = bool(price_max or open_after or open_before or open_late
                               or excluded_attributes or len(attributes) >= 2)
    ref_forces_category = bool((reference_area or reference_poi)
                               and has_ref_constraints)
    if has_nav:
        intent = "Navigation"
    elif ambiguous:
        intent = "Ambiguous"
    elif has_current_loc:
        intent = "Nearby Search"
    elif ref_coords and (category or brand or poi_name):
        intent = "Nearby Search"
    elif reference_poi and not ref_forces_category:
        intent = "Nearby Search"
    elif reference_area and not ref_forces_category:
        intent = "Nearby Search"
    elif reference_address:
        intent = "Nearby Search"
    elif direct_address and not poi_span:
        intent = "Address Search"
    elif poi_span and not ref_forces_category:
        intent = "POI Search"
    elif resolved_poi or full_poi or facility_poi:
        intent = "POI Search"
    elif brand and category:
        intent = "Brand Category Search"
    elif has_discovery:
        intent = "Discovery Search"
    elif category or dish:
        intent = "Category Search"
    elif poi_name:
        intent = "POI Search"

    # ---- assemble entities ---------------------------------------------
    ent: Dict = {}
    if intent == "Ambiguous":
        ent = ambiguous
    elif intent == "Navigation":
        ent["action"] = "directions"
        if parsed_route:
            if parsed_route.get("origin"):
                ent["origin"] = parsed_route["origin"]
            if parsed_route.get("destination_type") == "category":
                ent["category"] = parsed_route["destination"]
            elif parsed_route.get("destination_type") in {"city", "district"}:
                ent["route_destination"] = parsed_route["destination"]
            else:
                ent["poi_name"] = parsed_route["destination"]
            if parsed_route.get("destination_city"):
                ent["city"] = parsed_route["destination_city"]
            if parsed_route.get("destination_district"):
                ent["district"] = parsed_route["destination_district"]
        elif poi_name:
            ent["poi_name"] = poi_name
        elif category:
            ent["category"] = category
    else:
        if intent == "POI Search" and poi_name:
            ent["poi_name"] = poi_name
        if category and intent != "POI Search":
            ent["category"] = category
        elif category and intent == "POI Search" and poi_obj is None:
            ent["category"] = category
        elif category and intent == "POI Search" and poi_obj is not None \
                and fold(poi_obj.category) == fold(category):
            ent["category"] = category
        if brand:
            ent["brand"] = brand
        if dish:
            ent["dish"] = dish
        if district:
            ent["district"] = district
        if city:
            ent["city"] = city
        if street and intent == "Address Search":
            ent["street"] = street
        elif street and not brand and intent != "POI Search" \
                and not reference_area and not reference_address:
            ent["street"] = street
        if ward:
            ent["ward"] = ward
        if intent == "Address Search":
            if address_match:
                ent["house_number"] = address_match.group(1)
            ent.pop("poi_name", None)
        if attributes:
            if len(attributes) == 1:
                ent["attribute"] = attributes[0]
            else:
                ent["attributes"] = attributes
        if excluded_attributes:
            ent["excluded_attributes"] = excluded_attributes
        if reference_poi and not ref_forces_category:
            ent["reference_poi"] = reference_poi
        elif reference_poi and ref_forces_category:
            ent["location"] = reference_poi
        if reference_area:
            ent["reference_area"] = reference_area
        if reference_address:
            ent["reference_address"] = reference_address
        if ref_coords:
            ent["latitude"], ent["longitude"] = ref_coords
        if has_current_loc:
            ent["location"] = "current_location"
        if price_max:
            ent["price_max"] = price_max
        if open_after:
            ent["open_after"] = open_after
        if open_before:
            ent["open_before"] = open_before
        if open_late and not open_after:
            ent["open_late"] = True
        if open_24h:
            ent["open_24h"] = True
        if open_now:
            ent["open_now"] = True
        if route_destination:
            ent["route_destination"] = route_destination

    normalized = _build_normalized(exp_tokens, spans, kb, intent, ent,
                                   resolved_poi or full_poi, facility_poi)
    conf = _confidence(intent, ent, spans, abbrev_hits)
    debug = {"abbrev": abbrev_hits, "spans": [(s.type, s.canonical) for s in spans],
             "first_token_prefix": ({
                 "type": prefix_hint.kind,
                 "canonical": prefix_hint.canonical,
                 "surface": prefix_hint.surface,
                 "consumed_tokens": prefix_hint.consumed_tokens,
             } if prefix_hint else None),
             "category": category, "attrs": attributes,
             "excluded_attrs": excluded_attributes}
    return QueryUnderstanding(raw=raw, normalized_query=normalized, intent=intent,
                              entities={k: v for k, v in ent.items()
                                        if v not in (None, [], {})},
                              confidence=conf, debug=debug)


def _build_normalized(exp_tokens, spans, kb, intent, ent, resolved_poi,
                      facility_poi=None) -> str:
    if intent == "Coordinate Search":
        return f"{ent.get('latitude')},{ent.get('longitude')}"
    if intent == "Ambiguous":
        return title_vi(" ".join(_restore_token(t, kb) for t in exp_tokens))
    # POI Search: use the canonical name (correct casing) directly.
    if intent == "POI Search":
        base = facility_poi or (resolved_poi.name if resolved_poi else None) \
            or ent.get("poi_name")
        if base:
            if ent.get("district") and fold(ent["district"]) not in fold(base):
                return f"{base}, {ent['district']}"
            return base

    # Once a category-only query is grounded, its canonical entity is the
    # source of truth. Reconstructing fuzzy input here would reintroduce the
    # typo that category detection already resolved.
    if (intent == "Category Search" and ent.get("category")
            and set(ent) == {"category"}):
        return ent["category"]

    reconstructed = _reconstruct_tokens(exp_tokens, spans, kb)

    if intent == "Navigation":
        target = (ent.get("poi_name") or ent.get("category")
                  or ent.get("route_destination") or reconstructed)
        if ent.get("origin"):
            return f"Chỉ đường từ {ent['origin']} đến {target}"
        return f"Chỉ đường đến {target}"

    if intent == "Address Search" and ent.get("house_number") and ent.get("street"):
        text = f"{ent['house_number']} {ent['street']}"
        if ent.get("district"):
            text += f", {ent['district']}"
        if ent.get("city"):
            text += f", {ent['city']}"
        return text

    # Compose normalized queries from semantic slots. This avoids a growing
    # list of category/query-specific templates while keeping unmodelled text
    # available through the reconstruction fallback below.
    category = ent.get("category")
    dish = ent.get("dish")
    location = ent.get("reference_area") or ent.get("reference_poi") \
        or ent.get("reference_address") or ent.get("location")
    current_location = location == "current_location"
    named_location = None if current_location else location
    attrs = ent.get("attributes") or ([ent["attribute"]]
                                      if ent.get("attribute") else [])
    excluded = ent.get("excluded_attributes") or []
    structured = bool(dish or ent.get("brand") or attrs or excluded or location
                      or ent.get("price_max") or ent.get("open_after")
                      or ent.get("open_before") or ent.get("open_late")
                      or ent.get("open_24h") or ent.get("open_now")
                      or ent.get("latitude") is not None)
    if category and structured:
        text = f"Quán {dish.lower()}" if dish else category
        if ent.get("brand") and fold(ent["brand"]) not in fold(text):
            text += f" {ent['brand']}"

        rendered_attrs = []
        for attribute in attrs:
            fa = fold(attribute)
            if fa in {"mo khuya", "24/7"}:
                continue
            if fa.replace(" ", "") == "wifi":
                rendered = "có Wi-Fi"
            elif fa.startswith(("phu hop", "gan ")) or fa in {
                    "yen tinh", "lang man", "check in", "rooftop", "chay"}:
                rendered = attribute
            else:
                rendered = f"có {attribute}"
            if rendered not in rendered_attrs:
                rendered_attrs.append(rendered)
        if rendered_attrs:
            text += " " + " và ".join(rendered_attrs)

        if ent.get("open_after"):
            text += f" mở cửa sau {ent['open_after']}"
        if ent.get("open_before"):
            text += f" mở cửa trước {ent['open_before']}"
        if ent.get("open_late"):
            text += " mở khuya"
        if ent.get("open_24h"):
            text += " 24/7"
        if ent.get("open_now"):
            text += " đang mở cửa"
        for attribute in excluded:
            display = "Wi-Fi" if fold(attribute).replace(" ", "") == "wifi" else attribute
            prefix = "không" if fold(attribute).startswith(("mo ", "gan ")) else "không có"
            text += f" {prefix} {display}"
        if ent.get("price_max"):
            price = f"{int(ent['price_max']):,}".replace(",", ".")
            text += f" dưới {price}đ"
        if ent.get("latitude") is not None and ent.get("longitude") is not None:
            text += f" gần tọa độ {ent['latitude']},{ent['longitude']}"
        elif current_location:
            surface = fold(" ".join(exp_tokens))
            text += " gần tôi" if "gan toi" in surface else " gần đây"
        elif named_location:
            text += f" gần {named_location}"
        elif ent.get("district") or ent.get("city"):
            admin = ent.get("district") or ent.get("city")
            text += f" tại {admin}"
        return text

    return reconstructed


def _reconstruct_tokens(exp_tokens, spans, kb) -> str:
    """Rebuild text with canonical matched spans and restored accents."""
    out = list(exp_tokens)
    span_start = [None] * len(exp_tokens)
    for s in spans:
        if s.end <= len(out):
            out[s.start] = s.canonical
            span_start[s.start] = s.type
            for j in range(s.start + 1, s.end):
                out[j] = ""
    entries = []       # (text, keep_case)
    for i, tok in enumerate(out):
        if tok == "":
            continue
        if span_start[i] is not None:
            entries.append((tok, True))               # canonical casing
        else:
            entries.append((_restore_token(tok, kb).lower(), False))
    if entries and not entries[0][1]:
        t0 = entries[0][0]
        entries[0] = (t0[:1].upper() + t0[1:], False)
    text = " ".join(e[0] for e in entries)
    return text


def _confidence(intent, entities, spans, abbrev_hits) -> float:
    if intent == "Coordinate Search":
        return 0.99
    if (entities or {}).get("ambiguity_type") == "empty_query":
        return 0.0
    if (entities or {}).get("ambiguity_type") == "no_match":
        return 0.1
    base = 0.55
    n_ent = len([v for v in (entities or {}).values() if v])
    base += min(0.28, 0.06 * n_ent)
    if any(s.type in ("poi", "brand", "district", "city") for s in spans):
        base += 0.1
    if abbrev_hits:
        base += 0.05
    if intent == "Ambiguous":
        base = min(base, 0.5)
    return round(min(0.98, base), 2)
