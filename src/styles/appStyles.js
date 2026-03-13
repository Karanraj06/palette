// appStyles.js -- Application-Wide Inline Style Objects
// =======================================================
// Exports JS objects consumed as `style={...}` props across the app:
// header, nav buttons, length selector, main layout, text display,
// character-state colours, footer, and start-hint.
//
// All transition timings use cubic-bezier(0.22, 1, 0.36, 1) for a
// consistent, butter-smooth feel.
// ----------------------------------------------------------------------------

import TOKENS from "../constants/tokens";

export const appStyle = {
    minHeight: "100vh",
    background: TOKENS.bg,
    color: TOKENS.text,
    fontFamily: TOKENS.font,
    display: "flex",
    flexDirection: "column",
    userSelect: "none",
    outline: "none",
};

// ─── Header ─────────────────────────────────────────────────────────────────

export const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent:
        "space-between" /* Changed from gap: 24 to space-between for 3 clear sections */,
    padding: "14px 32px",
    borderBottom: "1px solid var(--navBorder)",
    position: "relative",
    zIndex: 10,
    maxWidth: 1300,
    margin: "0 auto",
    width: "100%",
};

export const logoStyle = {
    flex: 1, // Let logo take 1/3
    fontSize: 28,
    fontWeight: 400,
    fontFamily: "'Roboto Mono', 'JetBrains Mono', monospace",
    color: TOKENS.yellow,
    letterSpacing: "normal",
    // textTransform: "lowercase",
    marginRight: 8,
    display: "flex",
    alignItems: "center",
};

export const navStyle = {
    display: "flex",
    flex: 1, // Let nav take 1/3
    justifyContent: "center", // Center exactly
    flexWrap: "wrap",
    position: "relative",
    zIndex: 20,
};

export const navBtnStyle = {
    background: "none",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: TOKENS.muted,
    color: TOKENS.dimLight,
    fontFamily: "inherit",
    fontSize: 11,
    padding: "5px 10px",
    borderRadius: 4,
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
};

export const navDropdownContainerStyle = {
    position: "relative",
    display: "inline-block",
};

export const navDropdownListStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 8,
    background: TOKENS.bg,
    border: `1px solid ${TOKENS.borderLight}`,
    borderRadius: 6,
    padding: 4,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 160,
    zIndex: 100,
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
};

export const navDropdownItemStyle = {
    background: "none",
    border: "none",
    color: TOKENS.dimLight,
    fontFamily: "inherit",
    fontSize: 11,
    padding: "8px 12px",
    borderRadius: 4,
    cursor: "pointer",
    letterSpacing: "0.05em",
    textAlign: "left",
    transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
    width: "100%",
};

export const navDropdownItemActiveStyle = {
    color: "var(--btnHoverColor)",
    background: "var(--btnHoverBg)",
};

export const controlsStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1, // Let controls take 1/3
    justifyContent: "flex-end", // Align to right
};

export const lengthGroupStyle = { display: "flex", gap: 2 };

export const lengthBtnStyle = {
    background: "none",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: TOKENS.borderLight,
    color: TOKENS.dimMid,
    fontFamily: "inherit",
    fontSize: 10,
    padding: "4px 8px",
    borderRadius: 3,
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
};

export const lengthBtnActiveStyle = {
    borderColor: TOKENS.dim,
    color: "var(--btnActiveColor)",
};

export const iconBtnStyle = {
    background: "none",
    border: "none",
    color: TOKENS.dimLight,
    fontFamily: "inherit",
    fontSize: 14,
    cursor: "pointer",
    padding: "4px 6px",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
};

// ─── Stats bar ──────────────────────────────────────────────────────────────

export const statsBarStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 32px",
    borderBottom: `1px solid ${TOKENS.surface}`,
    fontSize: 11,
};

export const statStyle = { display: "flex", gap: 6, alignItems: "baseline" };
export const statLabelStyle = {
    color: TOKENS.dim,
    letterSpacing: "0.08em",
    fontSize: 10,
};
export const statValStyle = { color: TOKENS.statText, fontWeight: 500 };
export const statDividerStyle = { color: TOKENS.muted };

// ─── Main area ──────────────────────────────────────────────────────────────

export const mainStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 48px 20px",
    margin: "0 auto",
    width: "100%",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: 1300,
    zIndex: 5,
};

export const modeHintStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    marginBottom: 28,
};

export const modeHintTitleStyle = {
    fontSize: 12,
    color: TOKENS.dim,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
};

export const modeHintSubStyle = {
    fontSize: 11,
    color: TOKENS.dimDark,
    letterSpacing: "0.15em",
};

export const startHintStyle = {
    fontSize: 11,
    color: TOKENS.dim,
    letterSpacing: "0.1em",
    marginBottom: 12,
};

// ─── Text display ───────────────────────────────────────────────────────────

export const textAreaStyle = {
    fontSize: 37,
    fontWeight: 400,
    fontFamily: "'Roboto Mono', 'JetBrains Mono', monospace",
    lineHeight: "37px",
    letterSpacing: "normal",
    maxHeight: 320,
    minHeight: 111 /* ensures 3 lines minimum */,
    overflowY: "auto",
    overflowX: "hidden",
    textAlign: "left",
    width: "100%",
    wordBreak: "normal",
    overflowWrap: "normal",
    position: "relative",
    scrollBehavior: "smooth",
};

export const charStyle = {
    color: "var(--charNeutral)",
    display: "inline",
    transition: "color 0.06s cubic-bezier(0.16, 1, 0.3, 1)",
    position: "relative",
};

export const charCorrectStyle = { color: "var(--charCorrect)" };

export const charWrongStyle = {
    color: TOKENS.red,
    textDecoration: "underline",
    textDecorationColor: "var(--charWrongDeco)",
};

export const charReviewStyle = { color: TOKENS.yellow };

// ─── Footer ─────────────────────────────────────────────────────────────────

export const footerStyle = {
    padding: "12px 32px",
    textAlign: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0, // Ensure it spans across to help centering
    margin: "0 auto", // Center it horizontally
    maxWidth: 1300, // Match max-width of header
    width: "100%",
    borderTop: "1px solid var(--navBorder)",
};

export const footerHintStyle = {
    fontSize: 10,
    color: "var(--charNeutral)",
    letterSpacing: "0.08em",
};
