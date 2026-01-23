#!/usr/bin/env python3
"""
Ask a question against an OpenAI API Vector Store (File Search) using the Responses API.

Usage:
  export OPENAI_API_KEY="..."
  python ask_vs.py --vector-store-id vs_123 "What did I do at Adobe?"

Optional:
  python ask_vs.py --vector-store-id vs_123 --sources --model gpt-4.1 "Summarize my DevRel leadership style"
"""

import argparse
import os
import sys
from typing import Any, Dict, List

from openai import OpenAI

def extract_file_search_results(resp: Any) -> List[Dict[str, Any]]:
    """
    The Responses API can return tool calls in resp.output.
    When include=["file_search_call.results"] is set, the file_search_call item
    includes a .results array (snippets, filenames, scores, etc).
    """
    results: List[Dict[str, Any]] = []
    for item in getattr(resp, "output", []) or []:
        if getattr(item, "type", None) == "file_search_call":
            # item.results is typically a list of dict-like objects
            item_results = getattr(item, "results", None) or []
            for r in item_results:
                # Normalize to plain dict where possible
                try:
                    results.append(r.model_dump())
                except Exception:
                    try:
                        results.append(dict(r))
                    except Exception:
                        results.append({"raw": str(r)})
            break
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Ask a question against an OpenAI vector store.")
    parser.add_argument("question", help="The question to ask.")
    parser.add_argument("--vector-store-id", required=True, help="Vector store id (e.g., vs_...).")
    parser.add_argument("--model", default=os.environ.get("OPENAI_MODEL", "gpt-4.1"), help="Model name.")
    parser.add_argument("--max-output-tokens", type=int, default=500, help="Max tokens to generate.")
    parser.add_argument("--sources", action="store_true", help="Print retrieved sources/snippets.")
    parser.add_argument("--topk", type=int, default=None, help="(Optional) Hint for how many results to retrieve.")

    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY is not set.", file=sys.stderr)
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    instructions = (
        "You are an 'Ask AI about me' assistant.\n"
        "Answer using ONLY information found in file_search results from the vector store.\n"
        "If the answer is not supported by the retrieved text, say you don't know and suggest what to ask next.\n"
        "Be concise, recruiter-friendly, and factual."
    )

    tool_def: Dict[str, Any] = {
        "type": "file_search",
        "vector_store_ids": [args.vector_store_id],
    }
    # Some SDK/tooling versions support additional tool params; only include if user asked.
    if args.topk is not None:
        tool_def["max_num_results"] = args.topk  # safe "best-effort" (ignored if unsupported)

    resp = client.responses.create(
        model=args.model,
        instructions=instructions,
        input=args.question,
        tools=[tool_def],
        include=["file_search_call.results"],  # return retrieved snippets/results
        max_output_tokens=args.max_output_tokens,
    )

    print(resp.output_text.strip())

    if args.sources:
        results = extract_file_search_results(resp)
        if not results:
            print("\n--- Sources ---\n(no file_search results returned)\n", file=sys.stderr)
            return

        print("\n--- Sources ---")
        for i, r in enumerate(results, start=1):
            filename = r.get("filename") or r.get("file_id") or "unknown"
            score = r.get("score")
            # The content/snippet field name can vary; try common ones.
            snippet = (
                r.get("content")
                or r.get("text")
                or r.get("snippet")
                or r.get("chunk", {}).get("text")
                or ""
            )
            snippet = (snippet or "").strip()
            snippet = snippet[:800] + ("…" if len(snippet) > 800 else "")

            score_str = f" (score={score})" if score is not None else ""
            print(f"\n{i}. {filename}{score_str}\n{snippet}")

        print("\n--------------")


if __name__ == "__main__":
    main()
