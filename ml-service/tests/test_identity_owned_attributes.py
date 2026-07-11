"""Corpus-derived regressions for entity-owned attribute words.

These tests intentionally discover category/attribute collisions and POI names
from the loaded KB.  They do not read public evaluation rows or name a target
POI in the assertions.
"""
from __future__ import annotations

import re
import unittest
from collections import Counter, defaultdict

from tascomaps.constants import FACILITY_CATEGORIES
from tascomaps.core.text import fold, strip_accents, tokenize
from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine, _haversine


def _attribute_values(entities: dict) -> list[str]:
    values = []
    if entities.get("attribute"):
        values.append(str(entities["attribute"]))
    values.extend(str(value) for value in entities.get("attributes", []) or [])
    return values


def _category_attribute_collisions(kb) -> list[tuple[str, str, str]]:
    """Return (category, owned surface, canonical attribute) collisions."""
    collisions = {}
    categories = sorted(set(kb.category_terms.values()), key=fold)
    for category in categories:
        category_fold = fold(category)
        for surface, attribute in kb.attribute_terms.items():
            surface_fold = fold(surface)
            if len(surface_fold.split()) != 1:
                continue
            if not re.search(
                    r"(?<!\w)" + re.escape(surface_fold) + r"(?!\w)",
                    category_fold):
                continue
            collisions[(fold(category), surface_fold, fold(attribute))] = (
                category, surface, attribute)
    return [collisions[key] for key in sorted(collisions)]


def _external_attribute_surface(kb, owned_surface: str,
                                attribute: str) -> str:
    """Choose an explicit multi-token surface outside the owning identity."""
    owner_fold = fold(owned_surface)
    candidates = []
    for surface, canonical in kb.attribute_terms.items():
        tokens = fold(surface).split()
        if fold(canonical) != fold(attribute) or len(tokens) < 2:
            continue
        if owner_fold not in tokens:
            continue
        candidates.append(surface)
    if not candidates:
        raise AssertionError(
            f"no explicit external surface for corpus attribute {attribute!r}")
    return min(candidates, key=lambda value: (
        not fold(value).startswith(owner_fold + " "),
        len(fold(value).split()), fold(value)))


def _distinctive_progressive_case(kb, collisions):
    """Find a generic category prefix followed by a unique POI continuation."""
    category_folds = {fold(category): category
                      for category, _, _ in collisions}
    pois = sorted((poi for poi in kb.pois if poi.name),
                  key=lambda poi: (fold(poi.name), poi.source, poi.poi_id))
    for target in pois:
        category = category_folds.get(fold(target.category))
        if not category:
            continue
        name_tokens = tokenize(target.name)
        name_folds = [fold(token) for token in name_tokens]
        category_tokens = fold(category).split()
        for start in range(len(name_tokens) - len(category_tokens) + 1):
            if name_folds[start:start + len(category_tokens)] != category_tokens:
                continue
            # The preceding generic place word is what distinguishes a phrase
            # such as "<institution kind> <category>" from the bare category.
            if start == 0:
                continue
            generic_end = start + len(category_tokens)
            if generic_end >= len(name_tokens):
                continue
            generic = " ".join(name_tokens[:generic_end])
            for end in range(generic_end + 1, len(name_tokens)):
                prefix = " ".join(name_tokens[:end])
                matches = {
                    fold(poi.name) for poi in pois
                    if fold(poi.name).startswith(fold(prefix))
                }
                if matches == {fold(target.name)}:
                    return category, target, generic, prefix
    raise AssertionError(
        "corpus has no distinctive progressive POI for an attribute-owning "
        "category")


def _categories_absent_from_active_corpus(kb, search) -> list[str]:
    """Canonical unified-catalog categories not represented in P7's index."""
    active = {fold(poi.category) for poi in search.pois if poi.category}
    categories = {
        fold(poi.category): poi.category for poi in kb.pois
        if poi.category and fold(poi.category) not in active
    }
    return [categories[key] for key in sorted(categories)]


def _unique_non_active_exact_poi(kb, search):
    """Select a unique exact POI identity unavailable in the active index."""
    active_forms = set()
    for poi in search.pois:
        active_forms.update(search._identity_forms(poi))
    name_counts = Counter(fold(poi.name) for poi in kb.pois if poi.name)
    candidates = sorted(
        (poi for poi in kb.pois
         if poi.name
         and fold(poi.name) not in active_forms
         and name_counts[fold(poi.name)] == 1),
        key=lambda poi: (fold(poi.name), poi.source, poi.poi_id),
    )
    for poi in candidates:
        parsed = understand(poi.name, kb)
        if parsed.intent == "POI Search" and fold(
                parsed.entities.get("poi_name", "")) == fold(poi.name):
            return poi
    raise AssertionError("corpus has no unique non-active exact POI")


class IdentityOwnedAttributeRegressionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()
        cls.collisions = _category_attribute_collisions(cls.kb)
        if not cls.collisions:
            raise AssertionError(
                "corpus must contain at least one category/attribute collision")
        cls.search = SemanticSearchEngine(cls.kb)

    def test_bare_category_owns_colliding_attribute_word(self):
        for category, _surface, attribute in self.collisions:
            for query in (category, strip_accents(category)):
                with self.subTest(category=category, query=query):
                    result = understand(query, self.kb)
                    attributes = {fold(value)
                                  for value in _attribute_values(result.entities)}
                    self.assertEqual(result.intent, "Category Search")
                    self.assertEqual(
                        fold(result.entities.get("category", "")), fold(category))
                    self.assertNotIn(fold(attribute), attributes)

    def test_explicit_attribute_outside_identity_is_retained(self):
        for category, owned_surface, attribute in self.collisions:
            explicit = _external_attribute_surface(
                self.kb, owned_surface, attribute)
            canonical_query = f"{category} {explicit}"
            for query in (canonical_query, strip_accents(canonical_query)):
                with self.subTest(category=category, query=query):
                    result = understand(query, self.kb)
                    attributes = [fold(value)
                                  for value in _attribute_values(result.entities)]
                    self.assertEqual(
                        fold(result.entities.get("category", "")), fold(category))
                    self.assertEqual(attributes.count(fold(attribute)), 1)

    def test_generic_category_phrase_stays_category_but_distinctive_prefix_resolves(self):
        category, target, generic, distinctive = _distinctive_progressive_case(
            self.kb, self.collisions)

        for query in (generic, strip_accents(generic)):
            with self.subTest(kind="generic", query=query):
                result = understand(query, self.kb)
                self.assertEqual(result.intent, "Category Search")
                self.assertEqual(
                    fold(result.entities.get("category", "")), fold(category))
                self.assertNotIn("poi_name", result.entities)
                self.assertFalse(_attribute_values(result.entities))

        for query in (distinctive, strip_accents(distinctive),
                      target.name, strip_accents(target.name)):
            with self.subTest(kind="distinctive", query=query):
                result = understand(query, self.kb)
                self.assertEqual(result.intent, "POI Search")
                self.assertEqual(
                    fold(result.entities.get("poi_name", "")), fold(target.name))
                self.assertFalse(_attribute_values(result.entities))

    def test_p7_category_scope_never_returns_a_wrong_category(self):
        for category, _surface, _attribute in self.collisions:
            for query in (category, strip_accents(category)):
                with self.subTest(category=category, query=query):
                    output = self.search.search(query, top_k=5)
                    self.assertEqual(output["required_attributes"], [])
                    results = output["results"]
                    if results:
                        self.assertTrue(all(
                            fold(row.get("category", "")) == fold(category)
                            for row in results))
                    else:
                        self.assertEqual(
                            output["diagnostics"].get("status"), "no_matches")

    def test_every_missing_active_category_uses_exact_unified_catalog_scope(self):
        missing = _categories_absent_from_active_corpus(self.kb, self.search)
        self.assertTrue(missing)
        for category in missing:
            with self.subTest(category=category):
                output = self.search.search(category, top_k=50)
                self.assertTrue(output["results"])
                self.assertEqual(
                    output["diagnostics"].get("source_scope"),
                    "unified_catalog")
                self.assertTrue(all(
                    fold(row.get("category", "")) == fold(category)
                    for row in output["results"]))

    def test_non_active_exact_poi_uses_its_catalog_identity(self):
        target = _unique_non_active_exact_poi(self.kb, self.search)
        output = self.search.search(target.name, top_k=5)
        self.assertTrue(output["results"])
        self.assertEqual(
            output["diagnostics"].get("source_scope"), "unified_catalog")
        self.assertEqual(
            fold(output["results"][0]["name"]), fold(target.name))

    def test_active_category_does_not_use_unified_catalog_sidecar(self):
        counts = Counter(
            fold(poi.category) for poi in self.search.pois if poi.category)
        displays = {
            fold(poi.category): poi.category for poi in self.search.pois
            if poi.category
        }
        eligible = []
        for category_fold, count in counts.items():
            category = displays[category_fold]
            parsed = understand(category, self.kb)
            if fold(parsed.entities.get("category", "")) == category_fold:
                eligible.append((count, category))
        self.assertTrue(eligible)
        _, category = min(
            eligible, key=lambda item: (-item[0], fold(item[1])))

        output = self.search.search(category, top_k=5)
        self.assertTrue(output["results"])
        self.assertNotEqual(
            output["diagnostics"].get("source_scope"), "unified_catalog")
        self.assertNotIn("fallback_reason", output["diagnostics"])

    def test_missing_catalog_attribute_metadata_is_unknown_not_strict(self):
        missing_categories = _categories_absent_from_active_corpus(
            self.kb, self.search)
        selected = None
        for category in missing_categories:
            missing_metadata = [
                poi for poi in self.kb.pois
                if fold(poi.category) == fold(category)
                and not (poi.attributes or poi.tags or poi.description)
            ]
            if not missing_metadata:
                continue
            for surface, canonical in sorted(
                    self.kb.attribute_terms.items(),
                    key=lambda item: (
                        len(fold(item[0]).split()), fold(item[0]))):
                if fold(surface) in fold(category) \
                        or fold(canonical) in fold(category):
                    continue
                query = f"{category} có {surface}"
                parsed = understand(query, self.kb)
                attributes = {
                    fold(value) for value in _attribute_values(parsed.entities)
                }
                extra_entities = set(parsed.entities) - {
                    "category", "attribute", "attributes"}
                if fold(parsed.entities.get("category", "")) != fold(category) \
                        or fold(canonical) not in attributes \
                        or extra_entities:
                    continue
                output = self.search.search(query, top_k=50)
                rows = {
                    (str(row.get("poi_id", "")), fold(row.get("name", ""))): row
                    for row in output["results"]
                }
                unknown_rows = [
                    rows[(poi.poi_id, fold(poi.name))]
                    for poi in missing_metadata
                    if (poi.poi_id, fold(poi.name)) in rows
                ]
                if unknown_rows:
                    selected = canonical, output, unknown_rows
                    break
            if selected:
                break

        self.assertIsNotNone(
            selected, "corpus has no catalog-only row with missing attribute metadata")
        canonical, output, unknown_rows = selected
        self.assertEqual(
            output["diagnostics"].get("source_scope"), "unified_catalog")
        self.assertIn(fold(canonical), {
            fold(value) for value in output["required_attributes"]})
        self.assertEqual(
            output["diagnostics"].get("status"), "constraints_relaxed")
        self.assertGreater(
            int(output["diagnostics"].get("unknown_candidate_count", 0)), 0)
        for row in unknown_rows:
            self.assertEqual(float(row["signals"].get("attributes")), 0.5)
            self.assertFalse(any(
                fold(reason).startswith("phu hop:")
                for reason in row.get("reasons", [])))

    def test_category_with_admin_preposition_does_not_fabricate_poi(self):
        counts = Counter(
            (fold(poi.category), fold(poi.city))
            for poi in self.kb.pois_t2 if poi.category and poi.city)
        self.assertTrue(counts)
        category_fold, city_fold = min(
            counts, key=lambda key: (-counts[key], key))
        sample = next(
            poi for poi in self.kb.pois_t2
            if fold(poi.category) == category_fold
            and fold(poi.city) == city_fold)

        for preposition in ("ở", "tại"):
            query = f"{sample.category} {preposition} {sample.city}"
            with self.subTest(preposition=preposition, query=query):
                result = understand(query, self.kb)
                self.assertEqual(result.intent, "Category Search")
                self.assertEqual(
                    fold(result.entities.get("category", "")), category_fold)
                self.assertEqual(
                    fold(result.entities.get("city", "")), city_fold)
                self.assertNotIn("poi_name", result.entities)
                self.assertFalse(result.entities.get("candidates"))

    def test_category_with_observed_attribute_does_not_fabricate_poi(self):
        counts = Counter()
        displays = {}
        for poi in self.kb.pois_t2:
            for attribute in poi.attributes:
                attribute_fold = fold(attribute)
                if not poi.category or not attribute_fold \
                        or any(char.isdigit() for char in attribute_fold) \
                        or attribute_fold.startswith("gan ") \
                        or attribute_fold in fold(poi.category):
                    continue
                key = (fold(poi.category), attribute_fold)
                counts[key] += 1
                displays.setdefault(key, (poi.category, attribute))
        self.assertTrue(counts)
        key = min(counts, key=lambda value: (-counts[value], value))
        category, attribute = displays[key]

        result = understand(f"{category} có {attribute}", self.kb)
        self.assertEqual(result.intent, "Category Search")
        self.assertEqual(
            fold(result.entities.get("category", "")), fold(category))
        self.assertIn(fold(attribute), {
            fold(value) for value in _attribute_values(result.entities)})
        self.assertNotIn("poi_name", result.entities)
        self.assertFalse(result.entities.get("candidates"))

    def test_district_token_that_folds_to_motion_word_is_not_navigation(self):
        districts = sorted({
            value for value in (
                *self.kb.districts.values(),
                *(poi.district for poi in self.kb.pois))
            if value and "tu" in fold(value).split()
        }, key=fold)
        self.assertTrue(districts)
        for district in districts:
            for query in (district, strip_accents(district)):
                with self.subTest(district=district, query=query):
                    result = understand(query, self.kb)
                    self.assertNotEqual(result.intent, "Navigation")
                    self.assertNotIn("action", result.entities)
                    self.assertEqual(
                        fold(result.entities.get("district", "")),
                        fold(district))

    def test_external_admin_after_exact_catalog_poi_is_enforced(self):
        active_forms = set()
        for poi in self.search.pois:
            active_forms.update(self.search._identity_forms(poi))
        name_counts = Counter(
            fold(poi.name) for poi in self.kb.pois if poi.name)
        targets = sorted(
            (poi for poi in self.kb.pois
             if poi.name
             and fold(poi.name) not in active_forms
             and name_counts[fold(poi.name)] == 1
             and understand(poi.name, self.kb).intent == "POI Search"),
            key=lambda poi: (fold(poi.name), poi.source, poi.poi_id),
        )
        self.assertTrue(targets)

        values = {
            "city": sorted(set(self.kb.cities.values()), key=fold),
            "district": sorted(set(self.kb.districts.values()), key=fold),
        }
        for kind in ("city", "district"):
            case = None
            for target in targets:
                for external in values[kind]:
                    if fold(external) == fold(getattr(target, kind)) \
                            or fold(external) in fold(target.name):
                        continue
                    query = f"{target.name} tại {external}"
                    parsed = understand(query, self.kb)
                    if fold(parsed.entities.get("poi_name", "")) \
                            == fold(target.name) \
                            and fold(parsed.entities.get(kind, "")) \
                            == fold(external):
                        case = target, external, query
                        break
                if case:
                    break
            self.assertIsNotNone(case, f"no external {kind} catalog case")
            target, external, query = case
            output = self.search.search(query, top_k=10)
            self.assertEqual(
                output["diagnostics"].get("source_scope"), "unified_catalog")
            self.assertEqual(output["diagnostics"].get("hard_location"), kind)
            if output["results"]:
                self.assertTrue(all(
                    fold(row["name"]) == fold(target.name)
                    and fold(row.get(kind, "")) == fold(external)
                    for row in output["results"]))
            else:
                self.assertEqual(
                    output["diagnostics"].get("status"), "no_matches")
                self.assertEqual(
                    output["diagnostics"].get("reason"),
                    "no_strict_location_candidates")

    def test_near_cross_track_duplicates_expose_qualified_identity(self):
        active_categories = {
            fold(poi.category) for poi in self.search.pois if poi.category}
        groups = defaultdict(list)
        for poi in self.kb.pois:
            if poi.name:
                groups[fold(poi.name)].append(poi)

        case = None
        for name, members in sorted(groups.items()):
            for index, left in enumerate(members):
                for right in members[index + 1:]:
                    if left.source == right.source \
                            or fold(left.category) != fold(right.category) \
                            or fold(left.category) in active_categories \
                            or None in (left.lat, left.lng, right.lat, right.lng):
                        continue
                    distance = _haversine(
                        (left.lat, left.lng), (right.lat, right.lng))
                    if distance <= 0.2:
                        case = name, left.category, members, distance
                        break
                if case:
                    break
            if case:
                break
        self.assertIsNotNone(case, "no near cross-track catalog duplicate")
        name, category, members, distance = case
        self.assertLessEqual(distance, 0.2)

        output = self.search.search(category, top_k=50)
        same_name = [
            row for row in output["results"] if fold(row["name"]) == name]
        self.assertEqual(len(same_name), 1)
        self.assertGreaterEqual(
            int(output["diagnostics"].get("deduplicated_count", 0)), 1)
        row = same_name[0]
        self.assertEqual(
            row["identity_key"], f"{row['source']}:{row['poi_id']}")
        self.assertIn(
            (row["source"], row["poi_id"]),
            {(poi.source, poi.poi_id) for poi in members})

    def test_sparse_excluded_catalog_attribute_is_unknown(self):
        missing_categories = _categories_absent_from_active_corpus(
            self.kb, self.search)
        selected = None
        for category in missing_categories:
            sparse = [
                poi for poi in self.kb.pois
                if fold(poi.category) == fold(category)
                and not (poi.attributes or poi.tags or poi.description)
            ]
            if not sparse:
                continue
            for surface, canonical in sorted(
                    self.kb.attribute_terms.items(),
                    key=lambda item: (
                        len(fold(item[0]).split()), fold(item[0]))):
                if fold(surface) in fold(category) \
                        or fold(canonical) in fold(category):
                    continue
                query = f"{category} không có {surface}"
                parsed = understand(query, self.kb)
                excluded = {
                    fold(value) for value in
                    (parsed.entities.get("excluded_attributes", []) or [])
                }
                if parsed.entities.get("excluded_attribute"):
                    excluded.add(fold(parsed.entities["excluded_attribute"]))
                extra = set(parsed.entities) - {
                    "category", "excluded_attribute", "excluded_attributes"}
                if fold(parsed.entities.get("category", "")) != fold(category) \
                        or fold(canonical) not in excluded or extra:
                    continue
                output = self.search.search(query, top_k=50)
                rows = {
                    (str(row.get("poi_id", "")), fold(row.get("name", ""))): row
                    for row in output["results"]
                }
                sparse_rows = [
                    rows[(poi.poi_id, fold(poi.name))]
                    for poi in sparse
                    if (poi.poi_id, fold(poi.name)) in rows
                ]
                if sparse_rows:
                    selected = canonical, output, sparse_rows
                    break
            if selected:
                break

        self.assertIsNotNone(selected, "no sparse excluded-attribute case")
        canonical, output, sparse_rows = selected
        self.assertEqual(
            output["diagnostics"].get("source_scope"), "unified_catalog")
        self.assertIn(fold(canonical), {
            fold(value) for value in output["excluded_attributes"]})
        self.assertEqual(
            output["diagnostics"].get("status"), "constraints_relaxed")
        self.assertGreater(
            int(output["diagnostics"].get("unknown_candidate_count", 0)), 0)
        for row in sparse_rows:
            self.assertEqual(
                float(row["signals"].get("excluded_attributes")), 0.5)

    def test_contained_category_is_soft_but_head_category_is_core(self):
        counts = Counter(
            fold(poi.category) for poi in self.search.pois if poi.category)
        displays = {
            fold(poi.category): poi.category for poi in self.search.pois
            if poi.category
        }
        eligible = []
        for category_fold, category in sorted(displays.items()):
            head = understand(category, self.kb)
            contained = understand(
                f"địa điểm có nhiều {category}", self.kb)
            if fold(head.entities.get("category", "")) != category_fold \
                    or fold(contained.entities.get("category", "")) \
                    != category_fold:
                continue
            eligible.append((counts[category_fold], category, head, contained))
            self.assertEqual(
                fold(self.search._core_identity(head)[1] or ""), category_fold)
            self.assertIsNone(self.search._core_identity(contained)[1])
        self.assertTrue(eligible)

        _, category, _head, _contained = min(
            eligible, key=lambda item: (-item[0], fold(item[1])))
        output = self.search.search(category, top_k=10)
        self.assertTrue(output["results"])
        self.assertTrue(all(
            fold(row.get("category", "")) == fold(category)
            for row in output["results"]))

    def test_head_category_wins_over_related_full_and_abbreviated_tail(self):
        categories = {
            fold(value): value for value in self.kb.category_terms.values()
            if value
        }
        related = set()
        for poi in self.kb.pois:
            for attribute in poi.attributes:
                tail = categories.get(fold(attribute))
                if poi.category and tail \
                        and fold(poi.category) != fold(tail):
                    related.add((poi.category, tail))

        case = None
        for head, tail in sorted(
                related, key=lambda item: (fold(item[0]), fold(item[1]))):
            abbreviations = sorted({
                entry.abbr for entry in self.kb.abbrev.values()
                if entry.type == "category"
                and fold(entry.expansion) == fold(tail)
            }, key=fold)
            if abbreviations:
                case = head, tail, abbreviations[0]
                break
        self.assertIsNotNone(
            case, "corpus has no related category with a typed abbreviation")
        head, tail, abbreviation = case

        for tail_surface in (tail, abbreviation):
            query = f"{head} có {tail_surface}"
            with self.subTest(query=query):
                result = understand(query, self.kb)
                self.assertEqual(result.intent, "Category Search")
                self.assertEqual(
                    fold(result.entities.get("category", "")), fold(head))
                self.assertNotEqual(
                    fold(result.entities.get("category", "")), fold(tail))
                self.assertNotIn("poi_name", result.entities)

    def test_route_marker_inside_admin_or_unknown_facility_is_not_split(self):
        linked_admin = sorted({
            value for value in self.kb.districts.values()
            if value and "tu" in fold(value).split()
        }, key=fold)
        self.assertTrue(linked_admin)
        district = linked_admin[0]
        linked = understand(f"đi {district}", self.kb)
        self.assertEqual(linked.intent, "Navigation")
        self.assertEqual(
            fold(linked.entities.get("route_destination", "")), fold(district))
        self.assertEqual(
            fold(linked.entities.get("district", "")), fold(district))
        self.assertNotIn("origin", linked.entities)

        unknown = "qzxvwjk"
        self.assertFalse(self.kb.lexicon.exact(fold(unknown)))
        available_categories = {
            fold(poi.category): poi.category for poi in self.kb.pois
            if poi.category in FACILITY_CATEGORIES
        }
        facilities = [
            available_categories[key] for key in sorted(available_categories)
        ]
        self.assertTrue(facilities)
        facility = facilities[0]
        query = f"đi {facility} Từ {unknown}"
        result = understand(query, self.kb)
        self.assertEqual(result.intent, "Navigation")
        self.assertNotIn("origin", result.entities)
        self.assertEqual(
            fold(result.entities.get("poi_name", "")),
            fold(f"{facility} Từ {unknown}"))

    def test_admin_to_admin_route_is_navigation_only(self):
        cities = sorted(set(self.kb.cities.values()), key=fold)
        self.assertGreaterEqual(len(cities), 2)
        origin, destination = cities[0], cities[-1]
        query = f"chỉ đường từ {origin} đến {destination}"
        parsed = understand(query, self.kb)
        self.assertEqual(parsed.intent, "Navigation")
        self.assertEqual(
            fold(parsed.entities.get("origin", "")), fold(origin))
        self.assertEqual(
            fold(parsed.entities.get("route_destination", "")),
            fold(destination))
        self.assertNotIn("poi_name", parsed.entities)
        self.assertNotIn("category", parsed.entities)

        output = self.search.search(query, top_k=5)
        self.assertEqual(output["results"], [])
        self.assertEqual(
            output["diagnostics"].get("status"), "navigation_only")
        self.assertEqual(
            fold(output["diagnostics"].get("origin", "")), fold(origin))
        self.assertEqual(
            fold(output["diagnostics"].get("destination", "")),
            fold(destination))

    def test_catalog_attribute_synonyms_expand_through_live_registry(self):
        active_categories = {
            fold(poi.category) for poi in self.search.pois if poi.category}
        synonyms = defaultdict(list)
        for surface, canonical in self.kb.attribute_terms.items():
            synonyms[fold(canonical)].append((surface, canonical))

        case = None
        catalog_only = sorted(
            (poi for poi in self.kb.pois
             if poi.category and fold(poi.category) not in active_categories),
            key=lambda poi: (
                fold(poi.category), fold(poi.name), poi.source, poi.poi_id),
        )
        for poi in catalog_only:
            document = fold(" ; ".join(
                value for value in
                [*poi.attributes, *poi.tags, poi.description] if value))
            if not document:
                continue
            for canonical_fold, terms in sorted(synonyms.items()):
                observed = sorted({
                    surface for surface, _ in terms
                    if fold(surface) in document
                }, key=fold)
                alternatives = sorted({
                    surface for surface, _ in terms
                    if fold(surface) not in document
                    and fold(surface) not in fold(poi.category)
                }, key=fold)
                if not observed or not alternatives:
                    continue
                query_surface = alternatives[0]
                query = f"{poi.category} có {query_surface}"
                parsed = understand(query, self.kb)
                if fold(parsed.entities.get("category", "")) \
                        != fold(poi.category) \
                        or canonical_fold not in {
                            fold(value) for value in
                            _attribute_values(parsed.entities)}:
                    continue
                case = poi, terms[0][1], query
                break
            if case:
                break
        self.assertIsNotNone(case, "no catalog attribute synonym case")
        target, canonical, query = case

        output = self.search.search(query, top_k=50)
        row = next((
            row for row in output["results"]
            if row["poi_id"] == target.poi_id
            and fold(row["name"]) == fold(target.name)
        ), None)
        self.assertIsNotNone(row)
        self.assertEqual(
            output["diagnostics"].get("source_scope"), "unified_catalog")
        self.assertIn(fold(canonical), {
            fold(value) for value in output["required_attributes"]})
        self.assertGreaterEqual(
            float(row["signals"].get("attributes", 0.0)), 0.62)

    def test_route_origin_category_ranks_nearest_physical_destination(self):
        name_counts = Counter(
            fold(poi.name) for poi in self.kb.pois if poi.name)
        origins = []
        for poi in self.kb.pois:
            if not poi.name or poi.lat is None or poi.lng is None \
                    or name_counts[fold(poi.name)] != 1:
                continue
            parsed = understand(poi.name, self.kb)
            if parsed.intent == "POI Search" and fold(
                    parsed.entities.get("poi_name", "")) == fold(poi.name):
                origins.append(poi)

        destinations = defaultdict(list)
        for poi in self.search.pois:
            if poi.category and poi.lat is not None and poi.lng is not None:
                destinations[fold(poi.category)].append(poi)

        geometric_cases = []
        for origin in origins:
            origin_coords = (origin.lat, origin.lng)
            for category_fold, pois in destinations.items():
                if len(pois) < 2 or fold(origin.category) == category_fold:
                    continue
                ranked = sorted(
                    (_haversine(origin_coords, (poi.lat, poi.lng)), poi)
                    for poi in pois)
                margin = ranked[1][0] - ranked[0][0]
                if margin <= 1.0:
                    continue
                category = pois[0].category
                query = f"chỉ đường từ {origin.name} đến {category}"
                geometric_cases.append(
                    (margin, origin, category, ranked[0][1], query))
        geometric_cases.sort(key=lambda item: (
            -item[0], fold(item[1].name), fold(item[2])))
        case = None
        for candidate in geometric_cases:
            _, origin, category, _nearest, query = candidate
            parsed = understand(query, self.kb)
            if parsed.intent == "Navigation" \
                    and fold(parsed.entities.get("origin", "")) \
                    == fold(origin.name) \
                    and fold(parsed.entities.get("category", "")) \
                    == fold(category):
                case = candidate
                break
        self.assertIsNotNone(case)
        _, _origin, category, nearest, query = case

        output = self.search.search(query, top_k=10)
        self.assertTrue(output["results"])
        self.assertEqual(
            output["diagnostics"].get("location_source"), "route_origin")
        self.assertTrue(all(
            fold(row.get("category", "")) == fold(category)
            for row in output["results"]))
        self.assertEqual(
            fold(output["results"][0]["name"]), fold(nearest.name))


if __name__ == "__main__":
    unittest.main()
