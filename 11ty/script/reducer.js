/**
 * Conversation reducer
 *
 * - Keeps a rolling semantic summary
 * - Limits growth
 * - Resets intelligently when topic shifts
 *
 * No AI calls. Pure deterministic logic.
 */

const MAX_SUMMARY_CHARS = 1200; // ~200–250 tokens
const MAX_SENTENCES = 6;

/**
 * Very lightweight topic shift detector.
 * If overlap is low, we reset the summary.
 */
function isTopicShift(summary, question) {
  if (!summary) return false;

  const a = new Set(summary.toLowerCase().split(/\W+/));
  const b = new Set(question.toLowerCase().split(/\W+/));

  let overlap = 0;
  for (const word of b) {
    if (a.has(word)) overlap++;
  }

  return overlap < 2; // heuristic, works well in practice
}

/**
 * Condense text into short factual bullets.
 */
function normalize(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([.?!])\s+/g, "$1 ")
    .trim();
}

/**
 * Reduce conversation state
 */
export function reduce(
  prevState,
  userQuestion,
  assistantAnswer
) {
  const prevSummary = prevState?.summary || "";

  // Reset summary if topic changes sharply
  let summary = isTopicShift(prevSummary, userQuestion)
    ? ""
    : prevSummary;

  const facts = [];

  if (userQuestion) {
    facts.push(`User asked about: ${normalize(userQuestion)}`);
  }

  if (assistantAnswer) {
    // Strip fluff: keep first few sentences only
    const sentences = normalize(assistantAnswer)
      .split(/(?<=[.?!])\s+/)
      .slice(0, 3)
      .join(" ");

    facts.push(`Assistant answered: ${sentences}`);
  }

  // Merge into summary
  summary = normalize(
    [summary, ...facts].filter(Boolean).join(" ")
  );

  // Hard cap length
  if (summary.length > MAX_SUMMARY_CHARS) {
    summary = summary.slice(0, MAX_SUMMARY_CHARS);
    summary = summary.replace(/\s+\S*$/, ""); // trim partial word
  }

  // Sentence cap
  const sentences = summary.split(/(?<=[.?!])\s+/);
  if (sentences.length > MAX_SENTENCES) {
    summary = sentences.slice(-MAX_SENTENCES).join(" ");
  }

  return {
    summary,
    lastQuestion: userQuestion,
    lastAnswer: assistantAnswer,
  };
}
