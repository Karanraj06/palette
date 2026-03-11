// alignTimeline.js -- LCS-based re-alignment of edited lyrics to original charTimeline
//
// When the user edits the transcribed lyrics (deletes words, fixes typos),
// the original charTimeline no longer matches 1:1. This utility uses the
// Longest Common Subsequence to find which original characters survived the
// edit, keeps their timestamps, and linearly interpolates gaps.

/**
 * Build a character-time map for `edited` text using the original `charTimeline`.
 * Uses LCS to match surviving characters, then interpolates timestamps for
 * characters that were added or moved.
 *
 * @param {string} editedText - The (possibly edited) lyrics text, already normalized
 * @param {Array<{char: string, time: number}>} charTimeline - Original server timeline
 * @returns {number[]} - Array of timestamps, same length as editedText
 */
export function alignEditedToTimeline(editedText, charTimeline) {
    if (!charTimeline || charTimeline.length === 0) {
        return new Array(editedText.length).fill(0);
    }

    // Build the original text string from charTimeline
    const originalText = charTimeline.map((c) => c.char).join("");

    // ── LCS with backtracking ────────────────────────────────────────────
    const n = editedText.length;
    const m = originalText.length;

    // For very long texts, use a space-optimized approach
    // But for lyrics (typically < 5000 chars), O(n*m) is fine
    if (n === 0) return [];

    // Build LCS table
    // Use Uint16Array for memory efficiency (lyrics won't exceed 65535 chars)
    const dp = [];
    for (let i = 0; i <= n; i++) {
        dp[i] = new Uint16Array(m + 1);
    }

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (editedText[i - 1] === originalText[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to find matched pairs: editedIdx → originalIdx
    const matchMap = new Array(n).fill(-1); // editedIdx → charTimeline index
    let i = n, j = m;
    while (i > 0 && j > 0) {
        if (editedText[i - 1] === originalText[j - 1]) {
            matchMap[i - 1] = j - 1;
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }

    // ── Build timestamp map with interpolation ───────────────────────────
    const timeMap = new Array(n).fill(-1);

    // First pass: assign known timestamps from matched characters
    for (let k = 0; k < n; k++) {
        if (matchMap[k] >= 0) {
            timeMap[k] = charTimeline[matchMap[k]].time;
        }
    }

    // Second pass: interpolate gaps
    // Find runs of -1s and lerp between surrounding known timestamps
    let prevTime = 0;
    let prevIdx = -1;

    for (let k = 0; k <= n; k++) {
        if (k === n || timeMap[k] >= 0) {
            const nextTime = k < n ? timeMap[k] : (charTimeline.length > 0
                ? charTimeline[charTimeline.length - 1].time
                : prevTime);
            const nextIdx = k;

            // Fill the gap from prevIdx+1 to nextIdx-1
            const gapSize = nextIdx - prevIdx - 1;
            if (gapSize > 0) {
                for (let g = 1; g <= gapSize; g++) {
                    const frac = g / (gapSize + 1);
                    timeMap[prevIdx + g] = prevTime + (nextTime - prevTime) * frac;
                }
            }

            if (k < n) {
                prevTime = timeMap[k];
                prevIdx = k;
            }
        }
    }

    // Safety: ensure no -1s remain
    for (let k = 0; k < n; k++) {
        if (timeMap[k] < 0) timeMap[k] = 0;
    }

    return timeMap;
}