// src/utils/sentimentUtils.js
// IMPORTANT:
// Frontend does NOT calculate sentiment.
// We TRUST backend / CNN-provided `rating` field.
// This file ONLY normalizes text + maps UI classes.

export const SENTIMENT = Object.freeze({
  EXTREME_FEAR: "Extreme Fear",
  FEAR: "Fear",
  NEUTRAL: "Neutral",
  GREED: "Greed",
  EXTREME_GREED: "Extreme Greed",
  UNKNOWN: "Unknown",
});

/**
 * Normalize backend rating string
 * Examples:
 *  - "neutral" -> "Neutral"
 *  - "extreme greed" -> "Extreme Greed"
 */
export function normalizeRating(rating) {
  if (!rating || typeof rating !== "string") {
    return SENTIMENT.UNKNOWN;
  }

  const r = rating.trim().toLowerCase();

  if (r === "extreme fear") return SENTIMENT.EXTREME_FEAR;
  if (r === "fear") return SENTIMENT.FEAR;
  if (r === "neutral") return SENTIMENT.NEUTRAL;
  if (r === "greed") return SENTIMENT.GREED;
  if (r === "extreme greed") return SENTIMENT.EXTREME_GREED;

  return SENTIMENT.UNKNOWN;
}

/**
 * Map normalized sentiment -> CSS class
 * (used by badges and F&G value box)
 */
export function getSentimentClass(sentiment) {
  switch (sentiment) {
    case SENTIMENT.EXTREME_FEAR:
      return "badge-extreme-fear";
    case SENTIMENT.FEAR:
      return "badge-fear";
    case SENTIMENT.NEUTRAL:
      return "badge-neutral";
    case SENTIMENT.GREED:
      return "badge-greed";
    case SENTIMENT.EXTREME_GREED:
      return "badge-extreme-greed";
    default:
      return "badge-neutral";
  }
}

/**
 * Format numeric score safely
 */
export function formatScore(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n.toFixed(digits);
}
