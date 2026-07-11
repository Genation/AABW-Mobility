from __future__ import annotations

import threading
import unittest

import numpy as np

from tascomaps.data.kb import POI
from tascomaps.index.embed import SentenceTransformerEmbedder
from tascomaps.index.store import HybridIndex, poi_document


class _RecordingModel:
    def __init__(self):
        self.encoded = []

    def encode(self, texts, **_kwargs):
        self.encoded.append(list(texts))
        return np.ones((len(texts), 3), dtype=np.float32)


class _FailingEmbedder:
    kind = "sentence-transformer"

    def encode_query(self, _text):
        raise RuntimeError("synthetic encode failure")

    def encode_queries(self, _texts):
        raise RuntimeError("synthetic encode failure")


class IndexRobustnessTests(unittest.TestCase):
    def test_e5_uses_required_literal_prompts(self):
        model = _RecordingModel()
        embedder = SentenceTransformerEmbedder.__new__(SentenceTransformerEmbedder)
        embedder.model = model
        embedder.model_name = "intfloat/multilingual-e5-small"
        embedder.query_prefix = "query: "
        embedder.document_prefix = "passage: "
        embedder.dim = 3

        embedder.encode_query("xin chào")
        embedder.encode_docs(["địa điểm thử nghiệm"])

        self.assertEqual(model.encoded[0], ["query: xin chào"])
        self.assertEqual(model.encoded[1], ["passage: địa điểm thử nghiệm"])

    def test_poi_document_contains_all_searchable_identity_fields(self):
        poi = POI(
            poi_id="X", source="test", name="Tên chính", name_en="English Name",
            aliases=["bí danh"], brand="Thương hiệu", category="Danh mục",
            sub_category="Danh mục con", address="12 Đường Mới", ward="Phường A",
            district="Quận B", city="Thành phố C", opening_hours="08:00-20:00",
            attributes=["thuộc tính"], tags=["tag"], description="mô tả",
        )
        document = poi_document(poi)
        for value in (poi.name, poi.name_en, poi.aliases[0], poi.address, poi.ward,
                      poi.opening_hours, poi.attributes[0], poi.description):
            self.assertIn(value, document)

    def test_dense_query_failure_returns_zero_signal_without_backend_swap(self):
        index = HybridIndex.__new__(HybridIndex)
        index.pois = [object(), object()]
        index.docs = ["one", "two"]
        index.embedder = _FailingEmbedder()
        index.doc_emb = np.ones((2, 3), dtype=np.float32)
        index._embedder_lock = threading.Lock()
        index._query_encoding_error_reported = True

        single = index.vector_scores("query")
        batch = index.vector_scores_many(["one", "two"])

        np.testing.assert_array_equal(single, np.zeros(2, dtype=np.float32))
        np.testing.assert_array_equal(batch, np.zeros((2, 2), dtype=np.float32))
        self.assertEqual(index.embedder.kind, "sentence-transformer")


if __name__ == "__main__":
    unittest.main()
