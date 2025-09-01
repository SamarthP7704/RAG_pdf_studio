import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from .rag.embed import embed_texts
from .rag.vectordb_faiss import FaissIndex
from .rag.ingest import ingest_pdf
from .rag.answer import synthesize

DATA_DIR = os.getenv("DATA_DIR", "./data")

app = FastAPI(title="PDF Chat Studio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class ChatReq(BaseModel):
    workspace_id: str
    message: str

@app.post("/workspaces")
def create_workspace(name: str = Form(...)):
    ws_dir = os.path.join(DATA_DIR, "workspaces", name)
    os.makedirs(ws_dir, exist_ok=True)
    os.makedirs(os.path.join(ws_dir, "index"), exist_ok=True)
    return {"workspace_id": name}

@app.post("/workspaces/{ws_id}/upload")
async def upload_pdf(ws_id: str, file: UploadFile = File(...)):
    ws_dir = os.path.join(DATA_DIR, "workspaces", ws_id)
    os.makedirs(ws_dir, exist_ok=True)
    pdf_path = os.path.join(ws_dir, file.filename)
    with open(pdf_path, "wb") as f:
        f.write(await file.read())
    chunks = ingest_pdf(pdf_path, os.path.join(ws_dir, "index"))
    return {"ok": True, "chunks_added": chunks}

@app.post("/chat")
def chat(req: ChatReq):
    ws_dir = os.path.join(DATA_DIR, "workspaces", req.workspace_id)
    idx_path = os.path.join(ws_dir, "index", "faiss.index")
    if not os.path.exists(idx_path):
        return {"answer": "No index yet. Upload PDFs first.", "citations": []}
    # load index and search
    # tiny trick: create empty index and load
    dummy = FaissIndex(768, idx_path)  # e5-base-v2 is 768-dim
    dummy.load()
    qvec = embed_texts([req.message])
    hits = dummy.search(qvec, k=6)
    return synthesize(req.message, hits)
