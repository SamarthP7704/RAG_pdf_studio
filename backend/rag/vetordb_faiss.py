# backend/rag/vectordb_faiss.py
from __future__ import annotations
import os, pickle
from pathlib import Path
import numpy as np

# Try FAISS; if not available (common on Python 3.13), fall back to pure NumPy.
USING_FAISS = False
try:
    import faiss  # type: ignore
    USING_FAISS = True
except Exception:
    USING_FAISS = False

class FaissIndex:
    """
    Unified interface:
      - add(vectors: np.ndarray, metas: list[dict])
      - search(q: np.ndarray, k: int = 6) -> list[dict]
      - save() / load()
    """
    def __init__(self, dim: int | None, path: str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.dim = dim
        self.meta: list[dict] = []

        # Storage for NumPy fallback
        self._vectors: np.ndarray | None = None

        if USING_FAISS and self.dim is not None:
            self.index = faiss.IndexFlatIP(self.dim)  # cosine if inputs are L2-normalized
        else:
            self.index = None  # not used in NumPy mode

    # ---------- helpers ----------
    def _vecfile(self) -> Path:
        # file next to .index to store vectors for NumPy mode
        return self.path.with_suffix(".npy")

    def _metafile(self) -> Path:
        return self.path.with_suffix(".meta.pkl")

    # ---------- persistence ----------
    def save(self):
        if USING_FAISS and self.index is not None:
            import faiss
            faiss.write_index(self.index, str(self.path))
        else:
            if self._vectors is None:
                self._vectors = np.zeros((0, self.dim or 0), dtype="float32")
            np.save(self._vecfile(), self._vectors)
        with open(self._metafile(), "wb") as f:
            pickle.dump({"meta": self.meta, "dim": self.dim}, f)

    def load(self):
        meta_path = self._metafile()
        if meta_path.exists():
            with open(meta_path, "rb") as f:
                data = pickle.load(f)
            self.meta = data.get("meta", [])
            if self.dim is None:
                self.dim = data.get("dim")

        if USING_FAISS and self.path.exists():
            import faiss
            self.index = faiss.read_index(str(self.path))
            # dim is embedded in the index; keep self.dim as-is or set from index
        else:
            vec_path = self._vecfile()
            if vec_path.exists():
                self._vectors = np.load(vec_path)
                if self.dim is None and self._vectors.size:
                    self.dim = self._vectors.shape[1]
            else:
                self._vectors = np.zeros((0, self.dim or 0), dtype="float32")

    # ---------- operations ----------
    def add(self, vectors: np.ndarray, metas: list[dict]):
        if vectors.ndim == 1:
            vectors = vectors.reshape(1, -1)

        if USING_FAISS and self.index is not None:
            self.index.add(vectors.astype("float32"))
        else:
            if self._vectors is None or self._vectors.size == 0:
                self._vectors = vectors.astype("float32")
            else:
                self._vectors = np.vstack([self._vectors, vectors.astype("float32")])
        self.meta.extend(metas)

    def search(self, q: np.ndarray, k: int = 6):
        if q.ndim == 1:
            q = q.reshape(1, -1)
        if USING_FAISS and self.index is not None:
            D, I = self.index.search(q.astype("float32"), k)
            out = []
            for score, idx in zip(D[0], I[0]):
                if idx == -1:
                    continue
                m = dict(self.meta[idx])
                m["score"] = float(score)
                out.append(m)
            return out
        else:
            # cosine via dot product (inputs assumed normalized by embedder)
            if self._vectors is None or self._vectors.size == 0:
                return []
            sims = (q.astype("float32") @ self._vectors.T)[0]  # (N,)
            k = min(k, sims.shape[0])
            topk_idx = np.argsort(-sims)[:k]
            out = []
            for idx in topk_idx:
                m = dict(self.meta[int(idx)])
                m["score"] = float(sims[int(idx)])
                out.append(m)
            return out
