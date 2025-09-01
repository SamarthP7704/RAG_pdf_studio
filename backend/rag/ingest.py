import os, numpy as np
from ..utils.pdf_text import extract_text_per_page
from .chunk import sentence_chunks
from .embed import embed_texts
from .vectordb_faiss import FaissIndex

def ingest_pdf(pdf_path: str, index_dir: str):
    # 1) extract text per page
    pages = list(extract_text_per_page(pdf_path))
    # 2) chunk
    all_chunks, metas = [], []
    for page_num, text in pages:
        for ch in sentence_chunks(text):
            metas.append({"page": page_num, "text": ch, "source": os.path.basename(pdf_path)})
            all_chunks.append(ch)
    # 3) embed
    vecs = embed_texts(all_chunks)
    # 4) index
    idx = FaissIndex(vecs.shape[1], os.path.join(index_dir, "faiss.index"))
    if os.path.exists(os.path.join(index_dir, "faiss.index")):
        idx.load()
    idx.add(vecs, metas)
    idx.save()
    return len(all_chunks)
