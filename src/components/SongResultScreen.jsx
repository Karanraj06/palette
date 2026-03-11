// SongResultScreen.jsx -- Post-game results with score, rank, and timeline
import TOKENS from "../constants/tokens";
import { calculateScore } from "../utils/scoring";
import PerformanceTimeline from "./PerformanceTimeline";

export default function SongResultScreen({
    results,
    onPlayAgain,
    onNewSong,
    charStates,
    charTimeMap,
}) {
    const { wpm, accuracy, elapsed, errors, totalChars, songName, duration,
        completion, isEarlyExit } = results;

    const { score, rank } = calculateScore({ wpm, accuracy, errors, totalChars, elapsed });

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div style={{ textAlign: "center", maxWidth: 550, margin: "0 auto" }}>
            {/* Rank badge */}
            <div style={{
                fontSize: 72, fontWeight: 700, fontFamily: "'Roboto Mono', monospace",
                color: rank.color, lineHeight: 1, marginBottom: 4,
                textShadow: `0 0 30px ${rank.color}40`,
            }}>
                {rank.letter}
            </div>
            <div style={{
                fontSize: 14, color: rank.color, marginBottom: 4,
                fontFamily: "'Roboto Mono', monospace",
            }}>
                {rank.label}
            </div>
            <div style={{
                fontSize: 24, color: TOKENS.text, fontFamily: "'Roboto Mono', monospace",
                fontWeight: 300, marginBottom: 8,
            }}>
                {score} <span style={{ fontSize: 12, color: TOKENS.dim }}>/ 1000</span>
            </div>
            <p style={{ fontSize: 11, color: TOKENS.dim, marginBottom: 28, letterSpacing: "0.05em" }}>
                {songName}
                {isEarlyExit && (
                    <span style={{ color: TOKENS.yellow, marginLeft: 8 }}>
                        (ended early — {completion}% completed)
                    </span>
                )}
            </p>

            {/* Stats grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: isEarlyExit ? "1fr 1fr 1fr 1fr 1fr" : "1fr 1fr 1fr 1fr",
                gap: 12, marginBottom: 16,
            }}>
                <StatCard label="WPM" value={wpm} color={TOKENS.yellow} />
                <StatCard label="Accuracy" value={`${accuracy}%`} color={TOKENS.green} />
                <StatCard label="Time" value={formatTime(elapsed)} color={TOKENS.dimLight} />
                <StatCard label="Errors" value={errors} color={TOKENS.red} />
                {isEarlyExit && (
                    <StatCard label="Completed" value={`${completion}%`} color={TOKENS.yellow} />
                )}
            </div>

            {/* Error heatmap timeline */}
            {charStates && charTimeMap && (
                <PerformanceTimeline
                    charStates={charStates}
                    charTimeMap={charTimeMap}
                    duration={duration || elapsed}
                />
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
                <button onClick={onPlayAgain} style={{
                    background: "none", border: `1px solid ${TOKENS.yellow}`,
                    color: TOKENS.yellow, fontFamily: "'Roboto Mono', monospace",
                    fontSize: 13, padding: "10px 24px", borderRadius: 6, cursor: "pointer",
                }}>
                    ↻ Replay
                </button>
                <button onClick={onNewSong} style={{
                    background: TOKENS.yellow, border: "none", color: "#1a1a1a",
                    fontFamily: "'Roboto Mono', monospace", fontSize: 13,
                    padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontWeight: 500,
                }}>
                    ↑ New Song
                </button>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div style={{
            padding: "12px 8px", borderRadius: 8,
            border: "1px solid var(--border)", background: "var(--surface)",
        }}>
            <div style={{
                fontSize: 24, fontWeight: 300, fontFamily: "'Roboto Mono', monospace", color,
            }}>
                {value}
            </div>
            <div style={{
                fontSize: 9, color: "var(--dim)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
                {label}
            </div>
        </div>
    );
}