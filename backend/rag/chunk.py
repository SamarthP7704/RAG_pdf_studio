import re
from typing import List, Tuple

def sentence_chunks(text: str, max_tokens: int = 480) -> List[str]:
    # crude but effective: split on double newlines or periods
    parts = re.split(r"\n\s*\n|(?<=[.?!])\s+", text)
    chunks, cur = [], ""
    for p in parts:
        if len(cur) + len(p) > max_tokens and cur:
            chunks.append(cur.strip())
            cur = p + " "
        else:
            cur += p + " "
    if cur.strip():
        chunks.append(cur.strip())
    return chunks
