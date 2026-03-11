// GlobalStyles.jsx -- Injected <style> tag for CSS animations, themes, cursor, etc.
export default function GlobalStyles() {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

      :root {
        --bg: #232323;
        --surface: #2c2c2c;
        --border: #3a3a3a;
        --borderLight: #333;
        --navBorder: #2a2a2a;
        --text: #d1d0c5;
        --dim: #656669;
        --dimLight: #8a8a8e;
        --dimDark: #505053;
        --dimMid: #6c6c70;
        --muted: #3a3a3a;
        --statText: #d1d0c5;
        --green: #00b755;
        --red: #ca4754;
        --yellow: #E2B715;
        --charNeutral: #5a5a5e;
        --charCorrect: #d1d0c5;
        --charWrongDeco: rgba(202, 71, 84, 0.5);
        --btnHoverColor: #E2B715;
        --btnHoverBg: rgba(226, 183, 21, 0.08);
        --btnActiveColor: #d1d0c5;
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        background: var(--bg);
        color: var(--text);
        overflow: hidden;
      }

      /* Scrollbar */
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #3a3a3a; border-radius: 2px; }
      ::-webkit-scrollbar-thumb:hover { background: #555; }

      /* Smooth cursor */
      .smooth-cursor {
        position: absolute;
        top: 0;
        left: 0;
        width: 2.5px;
        background: #E2B715;
        border-radius: 2px;
        pointer-events: none;
        z-index: 10;
        will-change: transform;
        transition: transform 0.08s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .smooth-cursor.idle {
        animation: cursor-blink 1s steps(2) infinite;
      }

      @keyframes cursor-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      /* Zen mode */
      .zen-mode header,
      .zen-mode footer {
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
      }

      header, footer {
        transition: opacity 0.4s ease;
      }

      .hide-cursor { cursor: none !important; }
      .hide-cursor * { cursor: none !important; }

      /* Animations */
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      @keyframes indeterminate {
        0% { width: 0%; margin-left: 0; }
        50% { width: 60%; margin-left: 20%; }
        100% { width: 0%; margin-left: 100%; }
      }

      /* Restart button */
      .restart-btn:hover {
        color: #E2B715 !important;
        transform: rotate(-45deg);
      }

      /* Focus */
      button:focus-visible {
        outline: 2px solid #E2B715;
        outline-offset: 2px;
      }

      /* ── Range slider (Spotify-style seekbar) ─────────────────────── */
      input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        height: 4px;
        border-radius: 2px;
        outline: none;
      }

      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #E2B715;
        cursor: pointer;
        border: none;
        box-shadow: 0 0 4px rgba(226, 183, 21, 0.4);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }

      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.3);
        box-shadow: 0 0 8px rgba(226, 183, 21, 0.6);
      }

      input[type="range"]::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #E2B715;
        cursor: pointer;
        border: none;
        box-shadow: 0 0 4px rgba(226, 183, 21, 0.4);
      }

      input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.3);
        box-shadow: 0 0 8px rgba(226, 183, 21, 0.6);
      }

      input[type="range"]:disabled::-webkit-slider-thumb {
        background: #555;
        cursor: default;
        box-shadow: none;
      }

      input[type="range"]:disabled::-moz-range-thumb {
        background: #555;
        cursor: default;
        box-shadow: none;
      }
    `}</style>
    );
}