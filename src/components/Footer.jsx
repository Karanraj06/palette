// Footer.jsx -- Minimal footer with shortcuts + branding
export default function Footer() {
    return (
        <footer
            className="app-footer"
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 32px",
                fontSize: 11,
                fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "0.05em",
                maxWidth: 1300,
                margin: "0 auto",
                width: "100%",
            }}
        >
            {/* Left: keyboard shortcuts */}
            <div style={{ display: "flex", gap: 16, color: "var(--dim)" }}>
                <span>
                    <kbd style={kbdStyle}>esc</kbd> reset
                </span>
                <span>
                    <kbd style={kbdStyle}>ctrl</kbd>+<kbd style={kbdStyle}>⌫</kbd> delete word
                </span>
            </div>

            {/* Center: branding */}
            <div
                style={{
                    color: "var(--dim)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                }}
            >
                <span style={{ opacity: 0.6 }}>♪</span>
                <span>song game</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <a
                    href="https://github.com/Karanraj06/song-game"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        color: "var(--dim)",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--yellow)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--dim)")}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    source
                </a>
            </div>

            {/* Right: version/status */}
            <div style={{ color: "var(--dim)", opacity: 0.5 }}>
                v1.0
            </div>
        </footer>
    );
}

const kbdStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 3,
    padding: "1px 5px",
    fontSize: 10,
    color: "var(--yellow)",
    fontFamily: "inherit",
};