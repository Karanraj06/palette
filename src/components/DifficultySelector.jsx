// DifficultySelector.jsx -- Pick game difficulty
import TOKENS from "../constants/tokens";

export const DIFFICULTIES = {
    chill: {
        id: "chill",
        label: "🎧 Chill",
        description: "Ignore case & punctuation",
        caseSensitive: false,
        ignorePunctuation: true,
    },
    normal: {
        id: "normal",
        label: "🎤 Normal",
        description: "Ignore case, punctuation counts",
        caseSensitive: false,
        ignorePunctuation: false,
    },
    pro: {
        id: "pro",
        label: "🔥 Pro",
        description: "Exact match — everything counts",
        caseSensitive: true,
        ignorePunctuation: false,
    },
};

export default function DifficultySelector({ selected, onSelect }) {
    return (
        <div
            style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 20,
            }}
        >
            {Object.values(DIFFICULTIES).map((diff) => {
                const isActive = selected === diff.id;
                return (
                    <button
                        key={diff.id}
                        onClick={() => onSelect(diff.id)}
                        style={{
                            background: isActive ? "rgba(226, 183, 21, 0.1)" : "none",
                            border: `1px solid ${isActive ? TOKENS.yellow : "var(--border)"}`,
                            color: isActive ? TOKENS.yellow : TOKENS.dim,
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: 12,
                            padding: "8px 16px",
                            borderRadius: 6,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ marginBottom: 2 }}>{diff.label}</div>
                        <div style={{ fontSize: 9, opacity: 0.7 }}>{diff.description}</div>
                    </button>
                );
            })}
        </div>
    );
}