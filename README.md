# PDF Chat Studio

A lightweight, local‑first **“ask your PDFs”** app. Upload one or more PDFs into a workspace, build a vector index, and chat with citations (page + snippet). Built for **fast prototyping** and **zero cloud lock‑in**.

> ✅ Differentiators vs. typical clones: multi‑PDF workspaces, table‑aware parsing (extensible), citations with page preview, feedback loop, and a FAISS→NumPy fallback so it runs even when FAISS wheels aren’t available (e.g., Python 3.13 on macOS).

---

## TL;DR

* **Backend:** FastAPI (Python) with `sentence-transformers`, PyMuPDF, FAISS (optional)
* **Frontend:** Vite + React + TypeScript
* **Indexing:** FAISS inner‑product index; automatic fallback to pure NumPy cosine search
* **Citations:** Each answer cites top passages with `(file:page)` and scores
* **Local‑first:** Uses local folders/SQLite by default; S3/Postgres ready later

---

## Features

* Create **Workspaces**, upload multiple PDFs, and ask questions across them
* **Chunk → Embed → Search → Answer** pipeline with page‑level citations
* Works **offline** (no external LLM required for MVP synthesis)
* **Feedback** hooks (thumbs up/down) to improve retrieval later
* Modular design; easy to swap: embed model, chunking, rerankers, LLMs

Roadmap (optional): streaming answers, reranking (e.g., bge‑reranker), auth (JWT/Clerk), pgvector, S3/MinIO storage, Stripe.

---

## Architecture

```
[React (Vite)]  ──HTTP──>  [FastAPI]
    │                        │
    │  upload PDFs           │  parse→chunk→embed
    │  ask questions         │  search (FAISS/NumPy) → synthesize
    │  render citations      │  return answer + (file:page)
```

**Backend flow**

1. Extract text per page (PyMuPDF)
2. Sentence-ish chunking
3. Encode chunks using `intfloat/e5-base-v2` (default; 768‑dim)
4. Store vectors + metadata (FAISS index + `.meta.pkl`, or NumPy `.npy` + meta)
5. On query: embed → top‑K search → return snippets + citations

---

## Tech Stack

* **FastAPI**, **Uvicorn**, **pydantic**
* **sentence-transformers** (default: `intfloat/e5-base-v2`)
* **faiss-cpu** (optional); else **NumPy fallback**
* **PyMuPDF** (`pymupdf`) for PDF text
* **React + Vite + TS** for UI

---

## Repo Structure

```
pdf_chat_studio/
├─ backend/
│  ├─ app.py                  # FastAPI app (routes: workspaces, upload, chat)
│  ├─ __init__.py
│  ├─ rag/
│  │  ├─ __init__.py
│  │  ├─ chunk.py             # sentence-ish chunker
│  │  ├─ embed.py             # sentence-transformers wrapper
│  │  ├─ ingest.py            # PDF → chunks → vectors → index
│  │  └─ vectordb_faiss.py    # FAISS/NumPy index with identical API
│  │  └─ answer.py            # simple synthesis and citations
│  └─ utils/
│     ├─ __init__.py
│     └─ pdf_text.py          # PyMuPDF per-page extractor
├─ frontend/
│  ├─ package.json            # Vite scaffold (React + TS)
│  └─ src/
│     ├─ lib/api.ts           # tiny client for the API
│     ├─ components/
│     │  ├─ Uploader.tsx
│     │  └─ Chat.tsx
│     └─ App.tsx              # minimal UI wiring
└─ data/                      # generated at runtime (workspaces, indices)
```

---

## Requirements

* **macOS/Windows/Linux**
* **Python 3.11+** (3.11 recommended; 3.13 works with NumPy fallback)
* **Node.js 18+** (via Homebrew or `nvm`)

> **Note on FAISS:** On Python 3.13, `faiss-cpu` wheels may be unavailable. The app silently falls back to pure NumPy search; you can later `pip install faiss-cpu` to enable FAISS.

---

## Quickstart

### 1) Backend

```bash
# from project root
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install fastapi uvicorn[standard] python-multipart pydantic<3 \
            sentence-transformers numpy pymupdf
# optional: try FAISS
pip install faiss-cpu || echo "FAISS not available; NumPy fallback will be used"

# go back to project root and run server (watch only backend dir)
cd ..
python -m uvicorn backend.app:app --reload --reload-dir backend --host 0.0.0.0 --port 8000
```

### 2) Frontend

```bash
# Node via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts && nvm use --lts

cd frontend
npm install
# point UI to API (default 8000)
echo 'VITE_API=http://localhost:8000' > .env.local
npm run dev
```

Open: `http://localhost:5173`

### 3) First run

1. In the UI, keep workspace name as `demo` (auto‑created)
2. Upload a small PDF (1–3 pages)
3. Ask a question → you’ll get an “answer” composed from top chunks + citations; later, swap in an LLM synthesis if desired.

---

## Configuration

Create `.env` at project root if you want to override defaults:

```
# FastAPI
API_HOST=0.0.0.0
API_PORT=8000

# Storage
DATA_DIR=./data

# Embeddings
EMBEDDING_MODEL=intfloat/e5-base-v2  # 768-dim
```

Frontend env in `frontend/.env.local`:

```
VITE_API=http://localhost:8000
```

---

## API Reference

### `POST /workspaces`

Create a workspace.

* **Form fields**: `name` (string)
* **200** `{ "workspace_id": "<name>" }`

### `POST /workspaces/{id}/upload`

Upload a PDF; triggers ingestion.

* **Form file**: `file` (PDF)
* **200** `{ "ok": true, "chunks_added": 123 }`

### `POST /chat`

Ask a question within a workspace.

* **JSON**: `{ "workspace_id": "demo", "message": "What is X?" }`
* **200**:

```json
{
  "answer": "<stitched top snippets>\n(file.pdf:3)",
  "citations": [
    {"source": "file.pdf", "page": 3, "score": 0.78, "text": "..."}
  ]
}
```

**cURL examples**

```bash
# create workspace
curl -F name=demo http://localhost:8000/workspaces

# upload
curl -F file=@/path/to/file.pdf http://localhost:8000/workspaces/demo/upload

# ask
curl -H 'Content-Type: application/json' \
     -d '{"workspace_id":"demo","message":"summarize the introduction"}' \
     http://localhost:8000/chat
```

---

## Data Model (logical)

* **workspaces/** (folder) → contains documents & `index/`
* **index/** stores

  * `faiss.index` + `faiss.index.meta.pkl` (FAISS mode)
  * *or* `faiss.npy` + `.meta.pkl` (NumPy fallback)
* Chunk metadata: `{ source, page, text }` (+score at query time)

> If you add a DB later: tables for `workspaces`, `documents`, `chunks`, `messages`, `feedback`.

---

## Ingestion Pipeline

1. `utils/pdf_text.extract_text_per_page` → (page, text)
2. `rag/chunk.sentence_chunks` → chunk list
3. `rag/embed.embed_texts` → normalized float32 vectors
4. `rag/vectordb_faiss.FaissIndex.add` → index + persist

---

## Swapping Components

* **Embedding model**: set `EMBEDDING_MODEL` to `gte-base`, `e5-large-v2`, etc. Make sure to adjust expected **dimension** in any custom code.
* **Reranking**: insert a reranker before synthesis (e.g., `bge-reranker-v2-m3`).
* **Synthesis**: replace `rag/answer.py` with an LLM call; keep citations.
* **Vector DB**: replace `FaissIndex` with pgvector/Pinecone/Milvus by implementing the same `add/search/save/load` interface.

---

## Troubleshooting

**`ImportError: attempted relative import with no known parent package`**
Run Uvicorn from the **project root**, not inside `backend/`, and ensure `backend/__init__.py` exists:

```bash
python -m uvicorn backend.app:app --reload --reload-dir backend --host 0.0.0.0 --port 8000
```

**`ModuleNotFoundError: No module named 'backend.rag.vectordb_faiss'`**
Make sure the file exists at `backend/rag/vectordb_faiss.py` (spelling matters).

**`faiss` not found / build errors (Python 3.13)**
Safe to ignore—NumPy fallback is used. Optional: `pip install faiss-cpu` on Python 3.11.

**`zsh: command not found: npm`**
Install Node via Homebrew or `nvm`. For `nvm`, add this to `~/.zshrc`:

```sh
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

**`npm ERR! enoent package.json`**
You’re not in a Vite app folder. Scaffold or `cd frontend` where `package.json` exists.

**Uvicorn reloading on frontend changes**
Use `--reload-dir backend` to avoid watching `frontend/node_modules`.

---

## Security & Privacy (local dev)

* All files and indices are stored under `./data/` by default
* No documents leave your machine in the MVP
* Add auth + S3/DB only when you need multi‑user deployments

---

## Scripts (optional helpers)

Create a `Makefile` or npm scripts if you prefer:

```Makefile
run-backend:
	python -m uvicorn backend.app:app --reload --reload-dir backend --port 8000

run-frontend:
	cd frontend && npm run dev
```

---

## Contributing

1. Fork & branch from `main`
2. Conventional commits (`feat:`, `fix:`, `docs:`)
3. PR with screenshots or before/after notes for UX changes

---

## License

MIT (replace with your preferred license)
