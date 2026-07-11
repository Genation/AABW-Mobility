"""Embedding provider with a graceful TF-IDF fallback.

Primary: a local multilingual sentence-transformer (``multilingual-e5-small``),
which handles Vietnamese well and runs offline after the first download.
Fallback: character/word TF-IDF (scikit-learn) so the semantic engine still
works with zero heavy dependencies or when TASCO_DISABLE_EMBED=1.
"""
from __future__ import annotations

from typing import List

import numpy as np

from .. import config


class SentenceTransformerEmbedder:
    kind = "sentence-transformer"

    def __init__(self, model_name: str):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
        lowered = model_name.casefold()
        self.query_prefix = "query: " if "e5" in lowered else ""
        self.document_prefix = "passage: " if "e5" in lowered else ""
        try:
            get_dim = getattr(self.model, "get_embedding_dimension", None) \
                or self.model.get_sentence_embedding_dimension
            self.dim = get_dim()
        except Exception:  # pragma: no cover - model-version compatibility
            self.dim = None

    def fit(self, corpus: List[str]) -> None:
        pass

    def _encode(self, texts, kind):
        # Newer Sentence Transformers models can expose task-aware routing.
        # Prefer it for general models. E5's exported prompt registry is often
        # empty, so its required literal prefixes must remain explicit.
        routed = getattr(self.model, f"encode_{kind}", None)
        prefix = self.query_prefix if kind == "query" else self.document_prefix
        if prefix:
            vecs = self.model.encode(
                [f"{prefix}{text}" for text in texts],
                normalize_embeddings=True, show_progress_bar=False)
        elif callable(routed):
            try:
                vecs = routed(texts, normalize_embeddings=True,
                              show_progress_bar=False)
            except TypeError:  # older task-router signature
                vecs = routed(texts)
        else:
            vecs = self.model.encode(
                texts,
                normalize_embeddings=True, show_progress_bar=False)
        array = np.nan_to_num(np.asarray(vecs, dtype=np.float32),
                              nan=0.0, posinf=0.0, neginf=0.0)
        norms = np.linalg.norm(array, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return array / norms

    def encode_docs(self, texts: List[str]) -> np.ndarray:
        return self._encode(texts, "document")

    def encode_query(self, text: str) -> np.ndarray:
        return self._encode([text], "query")[0]

    def encode_queries(self, texts: List[str]) -> np.ndarray:
        """Encode a batch of queries in one model call.

        P7 retrieves with both the raw query and a structured rewrite.  Keeping
        those in one batch avoids multiplying transformer overhead as query
        understanding becomes richer.
        """
        if not texts:
            return np.zeros((0, self.dim or 0), dtype=np.float32)
        return self._encode(texts, "query")


class TfidfEmbedder:
    kind = "tfidf"

    def __init__(self):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from ..core.text import fold
        self._fold = fold
        self.vectorizer = TfidfVectorizer(
            analyzer="char_wb", ngram_range=(2, 4), min_df=1)
        self.dim = None

    def fit(self, corpus: List[str]) -> None:
        self.matrix = self.vectorizer.fit_transform([self._fold(t) for t in corpus])
        self.dim = self.matrix.shape[1]

    def encode_docs(self, texts: List[str]) -> np.ndarray:
        import scipy.sparse as sp
        m = self.vectorizer.transform([self._fold(t) for t in texts])
        norms = np.asarray(sp.linalg.norm(m, axis=1), dtype=np.float64).reshape(-1, 1)
        norms[norms == 0] = 1.0
        dense = np.asarray(m.toarray(), dtype=np.float64)
        return np.nan_to_num(dense / norms).astype(np.float32, copy=False)

    def encode_query(self, text: str) -> np.ndarray:
        return self.encode_docs([text])[0]

    def encode_queries(self, texts: List[str]) -> np.ndarray:
        return self.encode_docs(texts)


_SENTENCE_EMBEDDERS = {}


def get_embedder(corpus: List[str] | None = None):
    """Build an embedder for one index, with a shared transformer model.

    A fitted TF-IDF vectorizer is corpus-specific, so returning a process-wide
    singleton silently gave later indexes the first index's vocabulary.  Dense
    transformer models are safe to share; lexical fallback instances are not.
    """
    if not config.DISABLE_EMBED:
        try:
            if config.EMBED_MODEL not in _SENTENCE_EMBEDDERS:
                _SENTENCE_EMBEDDERS[config.EMBED_MODEL] = \
                    SentenceTransformerEmbedder(config.EMBED_MODEL)
            return _SENTENCE_EMBEDDERS[config.EMBED_MODEL]
        except Exception as e:  # pragma: no cover - depends on environment
            print(f"[embed] sentence-transformer unavailable ({e}); using TF-IDF")
    return get_tfidf_embedder(corpus)


def get_tfidf_embedder(corpus: List[str] | None = None):
    """Return a newly fitted corpus-local fallback embedder."""
    embedder = TfidfEmbedder()
    if corpus:
        embedder.fit(corpus)
    return embedder
