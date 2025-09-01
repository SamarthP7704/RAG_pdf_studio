import fitz  # pymupdf

def extract_text_per_page(pdf_path: str):
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        text = page.get_text("text")
        yield i+1, text
