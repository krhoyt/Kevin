#!/usr/bin/env python3
"""
Usage:
  python ask_about_me.py "What is your experience with developer relations leadership?"

Env:
  OPENAI_API_KEY=...
  BIO_PATH=./biography.md
  OPENAI_MODEL=gpt-5.1  (recommended if you want 24h retention)
"""

import os
import sys
from openai import OpenAI, BadRequestError

MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-2025-04-14")
# gpt-5-mini
BIO_PATH = os.environ.get("BIO_PATH", "kevin-hoyt-bio.md")
API_KEY = os.environ.get("OPENAI_API_KEY", "")

SYSTEM_INSTRUCTIONS = """You are an 'Ask AI about me' assistant for Kevin Hoyt.
Answer using ONLY the biography provided.
If the biography does not contain the answer, say you don't know and suggest what to ask next.
Be concise, recruiter-friendly, and factual. Prefer concrete examples and outcomes.
"""

def load_bio(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    if not text.strip():
        raise ValueError("Biography file is empty.")
    return text

def main():
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print('Usage: python ask_about_me.py "Your question here"')
        sys.exit(1)

    question = sys.argv[1].strip()
    bio = load_bio(BIO_PATH)

    client = OpenAI(api_key=API_KEY)

    # Cache-friendly ordering: stable prefix first, variable question last.
    req = dict(
        model=MODEL,
        instructions=SYSTEM_INSTRUCTIONS,
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": "BIOGRAPHY (authoritative source):\n\n" + bio},
                    {"type": "input_text", "text": "\n\nUSER QUESTION:\n" + question},
                ],
            }
        ],
        prompt_cache_key="kevin-bio-cli-v1",
        max_output_tokens=500,
    )

    # Try extended retention; fall back if SDK doesn't support the arg.
    try:
        resp = client.responses.create(**req, prompt_cache_retention="24h")
    except BadRequestError as e:
        msg = ""
        try:
            msg = e.response.json().get("error", {}).get("message", "")
        except Exception:
            msg = str(e)

        if "prompt_cache_retention is not supported on this model" in msg:
            resp = client.responses.create(**req)
        else:
            raise

    print(resp.output_text.strip())

if __name__ == "__main__":
    main()
