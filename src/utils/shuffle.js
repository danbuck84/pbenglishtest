/**
 * Fisher-Yates shuffle with a simple seed derived from the question ID.
 * This ensures the same question always shows options in the same shuffled
 * order during a session, but not in the original A-B-C-D order.
 */
export function shuffleOptions(options, seed) {
  const shuffled = [...options];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Re-label A, B, C, D based on new order
  return shuffled.map((opt, idx) => ({
    ...opt,
    displayLabel: String.fromCharCode(65 + idx), // A, B, C, D
  }));
}

/** Derive a numeric seed from a string (question ID). */
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
