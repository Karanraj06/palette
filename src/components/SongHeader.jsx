// SongHeader.jsx -- Minimal header for song game
import TOKENS from "../constants/tokens";
import { headerStyle, logoStyle } from "../styles/appStyles";

export default function SongHeader({ onNewSong, showNewSong }) {
    return (
        <header style={headerStyle}>
            <div style={logoStyle}>
                <span>♪ song game</span>
            </div>

            <div style={{ flex: 1 }} />

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
        </header>
    );
}