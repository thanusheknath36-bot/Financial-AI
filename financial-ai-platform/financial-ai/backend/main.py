from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from anthropic import Anthropic
import fitz
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Financial AI Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    return file_bytes.decode("utf-8", errors="ignore")


SYSTEM = "You are a CFA-level financial analyst. Analyze the provided financial document and return ONLY valid JSON — no markdown, no preamble, no explanation. If you cannot find certain values, use null."

PROMPT = """Extract financial data and analyze this report. Return ONLY this JSON structure, nothing else:
{
  "company": "Company name or Unknown",
  "period": "Reporting period e.g. FY2024",
  "health_score": 0-100 integer,
  "risk_level": "Low|Moderate|High|Critical",
  "summary": "2-3 sentence overview of financial health",
  "metrics": {
    "revenue": number or null,
    "net_income": number or null,
    "total_assets": number or null,
    "total_debt": number or null,
    "shareholder_equity": number or null,
    "operating_cash_flow": number or null
  },
  "ratios": {
    "net_profit_margin": number or null,
    "roe": number or null,
    "debt_to_equity": number or null,
    "current_ratio": number or null
  },
  "strengths": ["strength 1","strength 2","strength 3"],
  "weaknesses": ["weakness 1","weakness 2"],
  "warnings": ["warning if any"],
  "recommendation": "1-2 sentence actionable recommendation"
}

DOCUMENT TEXT:
"""


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text(content, file.filename)
    truncated = text[:80000]

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1500,
        system=SYSTEM,
        messages=[{"role": "user", "content": PROMPT + truncated}],
    )

    raw = response.content[0].text
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)
