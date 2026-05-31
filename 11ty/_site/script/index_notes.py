#!/usr/bin/env python3
"""
Reads notes/*.md files and produces a single search-index JSON file.
Output: notes/search-index.json

Each entry contains:
  uuid, date, url, excerpt, body (plain text), and content-type flags.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path

NOTES_DIR = Path(__file__).parent.parent / "notes"
OUTPUT_FILE = NOTES_DIR / "search-index.json"


def parse_frontmatter(text):
    """Split YAML frontmatter from body. Returns (dict, body_str)."""
    if not text.startswith("---"):
        return {}, text

    end = text.find("\n---", 3)
    if end == -1:
        return {}, text

    fm_text = text[3:end].strip()
    body = text[end + 4:].strip()

    meta = {}
    for line in fm_text.splitlines():
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip().strip('"')

        if value.lower() == "true":
            meta[key] = True
        elif value.lower() == "false":
            meta[key] = False
        else:
            meta[key] = value

    return meta, body


def strip_markdown(text):
    """Convert markdown to plain text for indexing."""
    # Fenced code blocks → keep content, drop fences
    text = re.sub(r"```[^\n]*\n(.*?)```", r"\1", text, flags=re.DOTALL)
    # Inline code
    text = re.sub(r"`([^`]+)`", r"\1", text)
    # Links: keep label
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    # Images
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)
    # Headings
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    # Bold / italic
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)
    # Blockquotes
    text = re.sub(r"^>\s+", "", text, flags=re.MULTILINE)
    # Horizontal rules
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)
    # Collapse whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def date_from_filename(path):
    """Extract ISO date string from a filename like 2026-05-29.md."""
    stem = path.stem
    try:
        datetime.strptime(stem, "%Y-%m-%d")
        return stem
    except ValueError:
        return None


def build_index():
    entries = []

    for md_file in sorted(NOTES_DIR.glob("*.md")):
        date = date_from_filename(md_file)
        if date is None:
            continue  # skip non-date files

        raw = md_file.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(raw)

        if not meta.get("uuid"):
            continue  # skip files without expected frontmatter

        entry = {
            "uuid":     meta.get("uuid", ""),
            "date":     date,
            "url":      meta.get("permalink", ""),
            "excerpt":  meta.get("excerpt", ""),
            "body":     strip_markdown(body),
            "code":     meta.get("code", False),
            "image":    meta.get("image", False),
            "link":     meta.get("link", False),
            "video":    meta.get("video", False),
        }
        entries.append(entry)

    # Newest first
    entries.sort(key=lambda e: e["date"], reverse=True)
    return entries


def main():
    entries = build_index()
    OUTPUT_FILE.write_text(
        json.dumps(entries, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    print(f"Wrote {len(entries)} entries to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
