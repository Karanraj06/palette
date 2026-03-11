// LyricsPreview.jsx -- Review/edit lyrics + pick difficulty before playing
import { useState, useMemo } from "react";
import TOKENS from "../constants/tokens";
import DifficultySelector, { DIFFICULTIES } from "./DifficultySelector";

export default function LyricsPreview({
    lyrics,
    onConfirm,
    difficulty,
    onDifficultyChange,
    detectedLanguage,
    polishWarning,
}) {
    const [editedLyrics, setEditedLyrics] = useState(lyrics);
    const [isEditing, setIsEditing] = useState(false);

    const previewText = useMemo(() => {
        const diff = DIFFICULTIES[difficulty];
        let text = editedLyrics;
        if (diff?.ignorePunctuation) {
            text = text.replace(/[^\w\s]/g, "");
        }
        if (!diff?.caseSensitive) {
            text = text.toLowerCase();
        }
        return text;
    }, [editedLyrics, difficulty]);

    const charCount = previewText.replace(/\s+/g, " ").trim().length;
    const wordCount = previewText.replace(/\s+/g, " ").trim().split(/\s+/).length;

    return (
        <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{
                fontSize: 20, fontWeight: 300, color: TOKENS.text,
                fontFamily: "'Roboto Mono', monospace", marginBottom: 4, textAlign: "center",
            }}>
                Lyrics Preview
            </h2>
            <p style={{
                fontSize: 11, color: TOKENS.dim, textAlign: "center",
                marginBottom: 20, letterSpacing: "0.05em",
            }}>
                {isEditing
                    ? "Edit the original transcribed lyrics below."
                    : "This is what you'll type during the game."}
            </p>

            {/* Language badge + polish warning */}
            {(detectedLanguage || polishWarning) && (
                <div style={{ textAlign: "center", marginBottom: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {detectedLanguage && (
                        <span style={{
                            fontSize: 10, padding: "3px 10px", borderRadius: 12,
                            background: "rgba(79, 195, 247, 0.1)", border: "1px solid rgba(79, 195, 247, 0.3)",
                            color: "#4FC3F7", letterSpacing: "0.05em",
                        }}>
                            🌐 {detectedLanguage.toUpperCase()}
                        </span>
                    )}
                    {polishWarning && (
                        <span style={{
                            fontSize: 10, padding: "3px 10px", borderRadius: 12,
                            background: "rgba(226, 183, 21, 0.1)", border: "1px solid rgba(226, 183, 21, 0.3)",
                            color: TOKENS.yellow, letterSpacing: "0.05em",
                        }}>
                            ⚠ {polishWarning}
                        </span>
                    )}
                </div>
            )}

            {isEditing ? (
                <textarea
                    value={editedLyrics}
                    onChange={(e) => setEditedLyrics(e.target.value)}
                    style={{
                        width: "100%", minHeight: 200, padding: 16, borderRadius: 8,
                        border: `1px solid ${TOKENS.yellow}`, background: "var(--surface)",
                        color: TOKENS.text, fontFamily: "'Roboto Mono', monospace",
                        fontSize: 14, lineHeight: 1.8, resize: "vertical", outline: "none",
                    }}
                />
            ) : (
                <div style={{
                    padding: 16, borderRadius: 8, border: "1px solid var(--border)",
                    background: "var(--surface)", maxHeight: 250, overflowY: "auto",
                    fontSize: 14, fontFamily: "'Roboto Mono', monospace", lineHeight: 1.8,
                    color: TOKENS.text, whiteSpace: "pre-wrap",
                }}>
                    {previewText}
                </div>
            )}

            <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: TOKENS.dim }}>
                {charCount} characters · {wordCount} words
                {isEditing && (
                    <span style={{ color: TOKENS.yellow, marginLeft: 8 }}>
                        (editing original — preview updates when done)
                    </span>
                )}
            </div>

            <DifficultySelector selected={difficulty} onSelect={onDifficultyChange} />

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{
                    background: "none", border: `1px solid ${TOKENS.border}`,
                    color: TOKENS.dimLight, fontFamily: "'Roboto Mono', monospace",
                    fontSize: 12, padding: "8px 18px", borderRadius: 6, cursor: "pointer",
                }}>
                    {isEditing ? "Done Editing" : "✏️ Edit"}
                </button>
                <button onClick={() => onConfirm(editedLyrics)} style={{
                    background: TOKENS.yellow, border: "none", color: "#1a1a1a",
                    fontFamily: "'Roboto Mono', monospace", fontSize: 13,
                    padding: "8px 24px", borderRadius: 6, cursor: "pointer", fontWeight: 500,
                }}>
                    ▶ Start Game
                </button>
            </div>
        </div>
    );
}