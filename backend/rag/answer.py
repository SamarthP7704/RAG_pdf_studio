from typing import List

SYSTEM = """Answer using only the provided context. Cite each sentence as (source:page)."""

def synthesize(user_q: str, hits: List[dict]) -> dict:
    # very simple synthesis; plug an LLM later if you want
    # For the MVP, we return top passages as the "answer"
    snippets = [h["text"] for h in hits[:3]]
    cites = [f'{h["source"]}:{h["page"]}' for h in hits[:3]]
    answer = "\n\n".join(f"{s}\n({c})" for s, c in zip(snippets, cites))
    return {"answer": answer, "citations": hits[:3]}
