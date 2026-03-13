// SongHeader.jsx -- Minimal header for Palette
import TOKENS from "../constants/tokens";
import { headerStyle, logoStyle } from "../styles/appStyles";
import { useTheme } from "../contexts/ThemeContext";

export default function SongHeader({ onNewSong, showNewSong }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header style={headerStyle}>
            <div style={logoStyle}>
                <span>Palette ~</span>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--charNeutral)",
                        cursor: "pointer",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "color 0.15s ease, transform 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--yellow)";
                        e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--charNeutral)";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                >
                    {theme === "light" ? (
                        /* Moon icon — click to go dark */
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    ) : (
                        /* Sun icon — click to go light */
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    )}
                </button>

                {showNewSong && (
                    <button
                        onClick={onNewSong}
                        style={{
                            background: "none",
                            border: `1px solid var(--border)`,
                            color: TOKENS.dimLight,
                            fontFamily: "inherit",
                            fontSize: 11,
                            padding: "5px 12px",
                            borderRadius: 4,
                            cursor: "pointer",
                            letterSpacing: "0.05em",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = TOKENS.yellow;
                            e.currentTarget.style.borderColor = TOKENS.yellow;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = TOKENS.dimLight;
                            e.currentTarget.style.borderColor = "var(--border)";
                        }}
                    >
                        ↑ New Song
                    </button>
                )}
            </div>
        </header>
    );
}