// scoring.js -- Calculate a game score and rank

export function calculateScore({ wpm, accuracy, errors, totalChars, elapsed }) {
    // Base score from WPM (max ~400 points)
    const wpmScore = Math.min(400, wpm * 4);

    // Accuracy multiplier (0.0 - 1.0)
    const accMultiplier = Math.pow(accuracy / 100, 2); // Quadratic penalty for errors

    // Completion bonus
    const completionBonus = 100;

    // Speed bonus if faster than the song
    const charsPerSec = elapsed > 0 ? totalChars / elapsed : 0;
    const speedBonus = charsPerSec > 5 ? Math.min(100, (charsPerSec - 5) * 20) : 0;

    const totalScore = Math.round(
        (wpmScore + completionBonus + speedBonus) * accMultiplier
    );

    return {
        score: Math.max(0, Math.min(1000, totalScore)),
        wpmScore: Math.round(wpmScore),
        accMultiplier: Math.round(accMultiplier * 100),
        speedBonus: Math.round(speedBonus),
        rank: getRank(totalScore),
    };
}

function getRank(score) {
    if (score >= 900) return { letter: "S", color: "#FFD700", label: "Perfect Pitch" };
    if (score >= 750) return { letter: "A", color: "#00b755", label: "Rockstar" };
    if (score >= 600) return { letter: "B", color: "#4FC3F7", label: "On Beat" };
    if (score >= 400) return { letter: "C", color: "#E2B715", label: "Getting There" };
    if (score >= 200) return { letter: "D", color: "#FF9800", label: "Keep Practicing" };
    return { letter: "F", color: "#ca4754", label: "Off Key" };
}