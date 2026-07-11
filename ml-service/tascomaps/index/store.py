"""Hybrid POI index: dense embeddings + BM25 lexical, sharing one POI list.

Retrieval returns per-signal scores (semantic + lexical) which the ranking
layer (P7) combines with business signals. P9 uses the lexical/prefix side.
"""
from __future__ import annotations

import threading
from typing import Iterable, List, Tuple

import numpy as np
from rank_bm25 import BM25Okapi

from ..core.text import fold, fold_tokens
from ..data.kb import POI
from .embed import get_embedder, get_tfidf_embedder


def poi_document(p: POI) -> str:
    """Rich text used for semantic embedding of a POI."""
    parts = [p.name, p.name_en, " ".join(p.aliases), p.brand,
             p.category, p.sub_category,
             p.address, p.ward, p.district, p.city, p.opening_hours,
             p.description,
             " ".join(p.attributes), " ".join(p.tags),
             ]
    return ". ".join(x for x in parts if x)


def _minmax(a: np.ndarray) -> np.ndarray:
    if a.size == 0:
        return a
    lo, hi = float(a.min()), float(a.max())
    if hi - lo < 1e-9:
        return np.zeros_like(a)
    return (a - lo) / (hi - lo)


class HybridIndex:
    def __init__(self, pois: List[POI]):
        self.pois = pois
        self.docs = [poi_document(p) for p in pois]
        self._embedder_lock = threading.Lock()
        self._query_encoding_error_reported = False
        self.embedder = get_embedder(self.docs)
        try:
            self.doc_emb = self.embedder.encode_docs(self.docs) \
                if pois else np.zeros((0, 1))
        except Exception as error:  # model inference/OOM/version failure
            if self.embedder.kind == "tfidf":
                raise
            print(f"[embed] dense encoding unavailable ({error}); using TF-IDF")
            self.embedder = get_tfidf_embedder(self.docs)
            self.doc_emb = self.embedder.encode_docs(self.docs) \
                if pois else np.zeros((0, 1))
        self.doc_emb = np.nan_to_num(
            np.asarray(self.doc_emb, dtype=np.float32), copy=False,
            nan=0.0, posinf=0.0, neginf=0.0)
        self._bm25_corpus = [fold_tokens(d) for d in self.docs]
        self.bm25 = BM25Okapi(self._bm25_corpus) if pois else None

    def _report_query_encoding_failure(self, error: Exception) -> None:
        """Report one dense-query failure; lexical retrieval remains usable."""
        with self._embedder_lock:
            if not self._query_encoding_error_reported:
                print(f"[embed] query encoding unavailable ({error}); using lexical retrieval")
                self._query_encoding_error_reported = True

    def vector_scores(self, query_text: str) -> np.ndarray:
        if not self.pois:
            return np.zeros(0)
        try:
            q = self.embedder.encode_query(query_text)
        except Exception as error:
            self._report_query_encoding_failure(error)
            return np.zeros(len(self.pois), dtype=np.float32)
        q = np.nan_to_num(np.asarray(q, dtype=np.float32), copy=False,
                          nan=0.0, posinf=0.0, neginf=0.0)
        with np.errstate(over="ignore", invalid="ignore", divide="ignore"):
            scores = self.doc_emb @ q
        return np.nan_to_num(scores, nan=0.0, posinf=0.0, neginf=0.0)

    def vector_scores_many(self, query_texts: List[str]) -> np.ndarray:
        """Return a ``queries x POIs`` dense-score matrix."""
        if not query_texts:
            return np.zeros((0, len(self.pois)), dtype=np.float32)
        if not self.pois:
            return np.zeros((len(query_texts), 0), dtype=np.float32)
        try:
            queries = self.embedder.encode_queries(query_texts)
        except Exception as error:
            self._report_query_encoding_failure(error)
            return np.zeros((len(query_texts), len(self.pois)), dtype=np.float32)
        queries = np.nan_to_num(np.asarray(queries, dtype=np.float32), copy=False,
                                nan=0.0, posinf=0.0, neginf=0.0)
        with np.errstate(over="ignore", invalid="ignore", divide="ignore"):
            scores = np.einsum("qd,nd->qn", queries, self.doc_emb, optimize=True)
        return np.nan_to_num(np.asarray(scores, dtype=np.float32),
                             nan=0.0, posinf=0.0, neginf=0.0)

    def lexical_scores(self, query_text: str) -> np.ndarray:
        if not self.pois:
            return np.zeros(0)
        toks = fold_tokens(query_text)
        if not toks:
            return np.zeros(len(self.pois))
        return np.asarray(self.bm25.get_scores(toks), dtype=np.float32)

    def retrieve(self, query_text: str, top_k: int = 20,
                 alpha: float = 0.65) -> List[Tuple[int, float, float, float]]:
        """Return [(poi_idx, vec, lex, hybrid)] sorted by hybrid score."""
        vec = self.vector_scores(query_text)
        lex = self.lexical_scores(query_text)
        hybrid = alpha * _minmax(vec) + (1 - alpha) * _minmax(lex)
        order = np.argsort(-hybrid)[:top_k]
        return [(int(i), float(vec[i]), float(lex[i]), float(hybrid[i])) for i in order]

    def retrieve_fused(
            self, query_texts: Iterable[str], top_k: int = 20,
            rank_window: int | None = None) -> List[Tuple[int, float, float, float]]:
        """Fuse raw/re-written dense and lexical rankings with RRF.

        Reciprocal-rank fusion is insensitive to the incompatible score scales
        produced by BM25, TF-IDF, and sentence transformers.  Query variants
        and retrieval modalities get equal votes; empty or constant signals do
        not vote.  The returned tuple is compatible with :meth:`retrieve`, with
        the final field containing a normalized fused score.
        """
        if not self.pois:
            return []
        queries = []
        seen = set()
        for value in query_texts:
            key = fold(value)
            if key and key not in seen:
                seen.add(key)
                queries.append(value)
        if not queries:
            return []

        dense = self.vector_scores_many(queries)
        lexical = np.vstack([self.lexical_scores(q) for q in queries])
        n_docs = len(self.pois)
        window = min(n_docs, rank_window or max(top_k * 4, top_k))
        # Scale the usual RRF constant to the corpus.  Small test indexes should
        # not behave as though they contain millions of documents.
        rank_constant = max(5.0, min(60.0, n_docs / 2.0))
        fused = np.zeros(n_docs, dtype=np.float64)

        for matrix, positive_only in ((dense, False), (lexical, True)):
            for scores in matrix:
                scores = np.nan_to_num(np.asarray(scores, dtype=np.float64),
                                       nan=-np.inf, posinf=-np.inf, neginf=-np.inf)
                finite = scores[np.isfinite(scores)]
                if finite.size == 0 or float(finite.max() - finite.min()) < 1e-9:
                    continue
                # BM25 zero means no term evidence.  For dense scores, the
                # minimum-score tie is the equivalent no-evidence floor.  If
                # those documents vote, repeated query views reward corpus
                # order and can outrank the documents that actually matched.
                floor = 0.0 if positive_only else float(finite.min())
                eligible = np.flatnonzero(np.isfinite(scores) & (scores > floor + 1e-9))
                if eligible.size == 0:
                    continue
                order = eligible[np.argsort(-scores[eligible], kind="stable")][:window]
                previous = None
                tied_rank = 1
                for position, idx in enumerate(order, start=1):
                    value = float(scores[idx])
                    if previous is None or abs(value - previous) > 1e-9:
                        tied_rank = position
                        previous = value
                    fused[int(idx)] += 1.0 / (rank_constant + tied_rank)

        fused = _minmax(fused)
        dense_best = dense.max(axis=0) if dense.size else np.zeros(n_docs)
        lexical_best = lexical.max(axis=0) if lexical.size else np.zeros(n_docs)
        order = np.argsort(-fused, kind="stable")[:min(top_k, n_docs)]
        return [
            (int(i), float(dense_best[i]), float(lexical_best[i]), float(fused[i]))
            for i in order
        ]
