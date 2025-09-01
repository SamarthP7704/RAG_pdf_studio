from sentence_transformers import SentenceTransformer
import numpy as np
import os

_model = None
def get_model():
    global _model
    if _model is None:
        name = os.getenv("EMBEDDING_MODEL", "intfloat/e5-base-v2")
        _model = SentenceTransformer(name)
    return _model

def embed_texts(texts: list[str]) -> np.ndarray:
    m = get_model()
    vecs = m.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
    return vecs.astype("float32")
