// charState.js -- Character State Enum
// ======================================
// Defines the possible visual states for each character in the typing
// text: IDLE (not yet reached), CORRECT, WRONG, or REVIEW (backspaced).
// Used by TextDisplay to pick the right colour for each <span>.
// ----------------------------------------------------------------------------

const CHAR_STATE = {
    IDLE: "idle",
    CORRECT: "correct",
    WRONG: "wrong",
    REVIEW: "review",
};

export default CHAR_STATE;
