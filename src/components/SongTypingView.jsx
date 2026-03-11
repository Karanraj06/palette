// SongTypingView.jsx -- The main game: dual-cursor typing with audio playback
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import CHAR_STATE from "../constants/charState";
import TOKENS from "../constants/tokens";
import { alignEditedToTimeline } from "../utils/alignTimeline";
import {
    textAreaStyle,
    charStyle,
    charCorrectStyle,
    charWrongStyle,
} from "../styles/appStyles";

export default function SongTypingView({ songData, onGameComplete, difficulty, onBackToPreview }) {
    const { fullText, charTimeline, audioUrl, duration: songDuration } = songData;

    // Normalize lyrics text AND apply difficulty transformations
    const lyricsText = useMemo(() => {
        let text = fullText.replace(/\s+/g, " ").trim();
        if (difficulty?.ignorePunctuation) {
            text = text.replace(/[^\w\s]/g, "");
        }
        if (!difficulty?.caseSensitive) {
            text = text.toLowerCase();
        }
        return text;
    }, [fullText, difficulty]);

    // ── State ────────────────────────────────────────────────────────────────
    const [charStates, setCharStates] = useState(() =>
        new Array(lyricsText.length).fill(CHAR_STATE.IDLE)
    );
    const [userCursor, setUserCursor] = useState(0);
    const [songCursor, setSongCursor] = useState(0);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [errors, setErrors] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(songDuration || 0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const audioRef = useRef(null);
    const textRef = useRef(null);
    const userCursorElRef = useRef(null);
    const songCursorElRef = useRef(null);
    const animFrameRef = useRef(null);

    // Mutable refs for use inside event handlers (avoids stale closures)
    const userCursorRef = useRef(0);
    const charStatesRef = useRef(charStates);
    const errorsRef = useRef(0);
    const startedRef = useRef(false);
    const finishedRef = useRef(false);
    const lyricsRef = useRef(lyricsText);
    const startTimeRef = useRef(null);
    const difficultyRef = useRef(difficulty);

    userCursorRef.current = userCursor;
    charStatesRef.current = charStates;
    errorsRef.current = errors;
    startedRef.current = started;
    finishedRef.current = finished;
    lyricsRef.current = lyricsText;
    difficultyRef.current = difficulty;

    // ── Character → timestamp map (LCS-based alignment) ──────────────────────
    const charTimeMap = useMemo(() => {
        return alignEditedToTimeline(lyricsText, charTimeline);
    }, [lyricsText, charTimeline]);

    // ── Audio playback loop (runs independently of typing) ───────────────────
    const tickAudio = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const time = audio.currentTime;
        setCurrentTime(time);

        // Compute song cursor from time
        let idx = 0;
        for (let i = 0; i < charTimeMap.length; i++) {
            if (charTimeMap[i] <= time) idx = i + 1;
            else break;
        }
        setSongCursor(Math.min(idx, lyricsText.length));

        if (!audio.paused && !audio.ended) {
            animFrameRef.current = requestAnimationFrame(tickAudio);
        }
    }, [charTimeMap, lyricsText.length]);

    // Start / resume the rAF loop whenever audio plays
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => {
            setIsPlaying(true);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = requestAnimationFrame(tickAudio);
        };
        const onPause = () => {
            setIsPlaying(false);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
        };
        const onEnded = () => {
            setIsPlaying(false);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
            }
        };
        const onLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("timeupdate", onTimeUpdate);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [tickAudio]);

    // ── Start the game ───────────────────────────────────────────────────────
    const startGame = useCallback(() => {
        if (startedRef.current) return;
        setStarted(true);
        startTimeRef.current = Date.now();

        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.playbackRate = 1.0;
            audio.play().catch((err) => {
                console.warn("Audio play failed:", err);
            });
        }
    }, []);

    // ── Play / Pause toggle ──────────────────────────────────────────────────
    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            audio.playbackRate = 1.0;
            audio.play().catch(() => { });
        } else {
            audio.pause();
        }
    }, []);

    // ── Seek handler ─────────────────────────────────────────────────────────
    const handleSeek = useCallback((e) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    }, []);

    // ── End game (supports both full completion and early exit) ───────────────
    const endGame = useCallback((isEarlyExit = false) => {
        setFinished(true);
        const audio = audioRef.current;
        if (audio) audio.pause();

        const elapsedSecs = startTimeRef.current
            ? Math.floor((Date.now() - startTimeRef.current) / 1000)
            : 0;
        const totalChars = lyricsRef.current.length;
        const typedChars = userCursorRef.current;
        const correctChars = typedChars - errorsRef.current;
        const wpm =
            elapsedSecs >= 3
                ? Math.round(typedChars / 5 / (elapsedSecs / 60))
                : 0;
        const accuracy =
            typedChars > 0
                ? Math.min(100, Math.max(0, Math.round((correctChars / typedChars) * 100)))
                : 100;
        const completion = totalChars > 0
            ? Math.round((typedChars / totalChars) * 100)
            : 100;

        onGameComplete({
            wpm,
            accuracy,
            elapsed: elapsedSecs,
            errors: errorsRef.current,
            totalChars,
            typedChars,
            completion,
            isEarlyExit,
            songName: songData.fileName,
            duration: duration,
            charStates: [...charStatesRef.current],
            charTimeMap: charTimeMap,
        });
    }, [onGameComplete, songData.fileName, duration, charTimeMap]);

    // ── Helper: find previous word boundary ──────────────────────────────────
    const findPrevWordBoundary = useCallback((pos) => {
        const text = lyricsRef.current;
        if (pos <= 0) return 0;
        let i = pos - 1;
        while (i > 0 && text[i - 1] === " ") i--;
        while (i > 0 && text[i - 1] !== " ") i--;
        return i;
    }, []);

    // ── Reset to initial state ───────────────────────────────────────────────
    const resetGame = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.playbackRate = 1.0;
        }
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setCharStates(new Array(lyricsRef.current.length).fill(CHAR_STATE.IDLE));
        setUserCursor(0);
        setSongCursor(0);
        setStarted(false);
        setFinished(false);
        setErrors(0);
        setCurrentTime(0);
        setIsPlaying(false);
        startTimeRef.current = null;
    }, []);

    // ── Keyboard handler ─────────────────────────────────────────────────────
    const handleKey = useCallback(
        (e) => {
            if (finishedRef.current) return;

            const isCtrlBackspace =
                (e.ctrlKey || e.metaKey) && e.key === "Backspace";
            const isCtrlEnter =
                (e.ctrlKey || e.metaKey) && e.key === "Enter";

            // ── Ctrl+Enter → end race early
            if (isCtrlEnter) {
                e.preventDefault();
                if (startedRef.current) {
                    endGame(true);
                }
                return;
            }

            if ((e.metaKey || e.ctrlKey || e.altKey) && !isCtrlBackspace) return;

            // ── Escape → back to preview (if not started) or reset (if started)
            if (e.key === "Escape") {
                if (!startedRef.current && onBackToPreview) {
                    onBackToPreview();
                } else {
                    resetGame();
                }
                return;
            }

            // ── Ctrl+Backspace → delete whole word
            if (isCtrlBackspace) {
                e.preventDefault();
                const c = userCursorRef.current;
                if (c === 0) return;

                const boundary = findPrevWordBoundary(c);
                const newStates = [...charStatesRef.current];
                let errorsRemoved = 0;

                for (let i = c - 1; i >= boundary; i--) {
                    if (
                        newStates[i] === CHAR_STATE.WRONG &&
                        errorsRef.current - errorsRemoved > 0
                    ) {
                        errorsRemoved++;
                    }
                    newStates[i] = CHAR_STATE.IDLE;
                }

                setCharStates(newStates);
                setUserCursor(boundary);
                if (errorsRemoved > 0) {
                    setErrors((er) => Math.max(0, er - errorsRemoved));
                }
                return;
            }

            // ── Backspace → delete one char
            if (e.key === "Backspace") {
                e.preventDefault();
                const c = userCursorRef.current;
                if (c === 0) return;

                const newStates = [...charStatesRef.current];
                if (
                    newStates[c - 1] === CHAR_STATE.WRONG &&
                    errorsRef.current > 0
                ) {
                    setErrors((er) => er - 1);
                }
                newStates[c - 1] = CHAR_STATE.IDLE;
                setCharStates(newStates);
                setUserCursor(c - 1);
                return;
            }

            // Ignore non-printable keys
            if (e.key.length !== 1) return;
            e.preventDefault();

            // ── Start game on first keypress
            if (!startedRef.current) {
                startGame();
            }

            const c = userCursorRef.current;
            if (c >= lyricsRef.current.length) return;

            const expected = lyricsRef.current[c];
            const typed = e.key;

            const diff = difficultyRef.current;
            let correct;

            if (diff?.caseSensitive) {
                correct = typed === expected;
            } else {
                correct = typed.toLowerCase() === expected.toLowerCase();
            }

            const newStates = [...charStatesRef.current];
            newStates[c] = correct ? CHAR_STATE.CORRECT : CHAR_STATE.WRONG;
            setCharStates(newStates);

            if (!correct) setErrors((er) => er + 1);

            const newCursor = c + 1;
            setUserCursor(newCursor);

            if (newCursor >= lyricsRef.current.length) {
                endGame(false);
            }
        },
        [startGame, endGame, resetGame, findPrevWordBoundary, onBackToPreview]
    );

    // ── Attach keyboard listener ─────────────────────────────────────────────
    useEffect(() => {
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [handleKey]);

    // ── Cleanup on unmount ───────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // ── Ensure playbackRate stays at 1.0 ─────────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let rafId = null;
        const enforce = () => {
            if (audio.playbackRate !== 1.0) {
                audio.playbackRate = 1.0;
            }
            rafId = requestAnimationFrame(enforce);
        };
        rafId = requestAnimationFrame(enforce);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    // ── Cursor positioning helper ────────────────────────────────────────────
    const positionCursor = useCallback(
        (cursorEl, charIndex, container, shouldScroll) => {
            if (!cursorEl || !container) return;

            const targetIdx =
                charIndex >= lyricsText.length ? lyricsText.length - 1 : charIndex;
            const charEl = container.querySelector(`[data-idx="${targetIdx}"]`);
            if (!charEl) return;

            const containerRect = container.getBoundingClientRect();
            const charRect = charEl.getBoundingClientRect();

            const left =
                charIndex >= lyricsText.length
                    ? charRect.right - containerRect.left + container.scrollLeft
                    : charRect.left - containerRect.left + container.scrollLeft;
            const top = charRect.top - containerRect.top + container.scrollTop;

            cursorEl.style.transform = `translate(${left}px, ${top}px)`;
            cursorEl.style.height = `${charRect.height}px`;

            if (shouldScroll) {
                const charTopInContainer = charRect.top - containerRect.top;
                const visibleHeight = container.clientHeight;
                if (
                    charTopInContainer < 0 ||
                    charTopInContainer > visibleHeight - charRect.height
                ) {
                    container.scrollTo({
                        top: top - visibleHeight / 2 + charRect.height / 2,
                        behavior: "smooth",
                    });
                }
            }
        },
        [lyricsText.length]
    );

    useEffect(() => {
        positionCursor(userCursorElRef.current, userCursor, textRef.current, true);
    }, [userCursor, positionCursor]);

    useEffect(() => {
        positionCursor(songCursorElRef.current, songCursor, textRef.current, false);
    }, [songCursor, positionCursor]);

    useEffect(() => {
        const handleResize = () => {
            positionCursor(userCursorElRef.current, userCursor, textRef.current, false);
            positionCursor(songCursorElRef.current, songCursor, textRef.current, false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [userCursor, songCursor, positionCursor]);

    // ── Format time as m:ss ──────────────────────────────────────────────────
    const formatTime = (seconds) => {
        if (!seconds || !isFinite(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // ── Derived stats ───────────��────────────────────────────────────────────
    const elapsed = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;
    const wpm =
        elapsed >= 3 ? Math.round(userCursor / 5 / (elapsed / 60)) : 0;

    return (
        <div style={{ width: "100%", maxWidth: 1100 }}>
            <audio ref={audioRef} src={audioUrl} preload="auto" />

            {/* ── Status bar ──────────────────────────────────────────────── */}
            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 12, fontSize: 13, fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "0.05em",
            }}>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    <span style={{ color: TOKENS.yellow, fontSize: 11 }}>{songData.fileName}</span>
                    {started && <span style={{ color: TOKENS.green }}>{wpm} wpm</span>}
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* Back to preview button (only before game starts) */}
                    {!started && onBackToPreview && (
                        <button
                            onClick={onBackToPreview}
                            style={{
                                background: "none", border: `1px solid var(--border)`,
                                color: TOKENS.dim, fontFamily: "'Roboto Mono', monospace",
                                fontSize: 10, padding: "4px 10px", borderRadius: 4,
                                cursor: "pointer", letterSpacing: "0.05em",
                            }}
                        >
                            ← back to preview
                        </button>
                    )}
                    {/* End race button (only after game starts) */}
                    {started && !finished && (
                        <button
                            onClick={() => endGame(true)}
                            style={{
                                background: "none", border: `1px solid ${TOKENS.red}`,
                                color: TOKENS.red, fontFamily: "'Roboto Mono', monospace",
                                fontSize: 10, padding: "4px 10px", borderRadius: 4,
                                cursor: "pointer", letterSpacing: "0.05em",
                            }}
                        >
                            ■ end race
                        </button>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: TOKENS.dim }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E2B715", display: "inline-block" }} />
                        you
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: TOKENS.dim }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4FC3F7", display: "inline-block" }} />
                        song
                    </span>
                </div>
            </div>

            {/* ── Music player bar ────────────────────────────────────────── */}
            <div style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
                padding: "8px 12px", borderRadius: 8, background: "var(--surface)",
                border: "1px solid var(--border)",
            }}>
                <button onClick={togglePlayPause} disabled={!started}
                    style={{
                        background: "none", border: "none",
                        color: started ? TOKENS.yellow : TOKENS.dim,
                        cursor: started ? "pointer" : "default", padding: 4,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, opacity: started ? 1 : 0.4, transition: "opacity 0.2s ease",
                    }}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    )}
                </button>
                <span style={{ fontSize: 11, color: TOKENS.dim, fontFamily: "'Roboto Mono', monospace", minWidth: 36, textAlign: "right", flexShrink: 0 }}>
                    {formatTime(currentTime)}
                </span>
                <input type="range" min="0" max={duration || 0} step="0.1" value={currentTime}
                    onChange={handleSeek} onMouseDown={() => setIsSeeking(true)} onMouseUp={() => setIsSeeking(false)}
                    disabled={!started}
                    style={{
                        flex: 1, height: 4, appearance: "none", WebkitAppearance: "none",
                        background: `linear-gradient(to right, ${TOKENS.yellow} 0%, ${TOKENS.yellow} ${duration ? (currentTime / duration) * 100 : 0}%, var(--border) ${duration ? (currentTime / duration) * 100 : 0}%, var(--border) 100%)`,
                        borderRadius: 2, outline: "none", cursor: started ? "pointer" : "default",
                        opacity: started ? 1 : 0.3, transition: "opacity 0.2s ease",
                    }}
                />
                <span style={{ fontSize: 11, color: TOKENS.dim, fontFamily: "'Roboto Mono', monospace", minWidth: 36, flexShrink: 0 }}>
                    {formatTime(duration)}
                </span>
            </div>

            {/* ── Start hint ──────────────────────────────────────────────── */}
            {!started && (
                <div style={{
                    textAlign: "center", fontSize: 12, color: TOKENS.dim,
                    letterSpacing: "0.1em", marginBottom: 12, animation: "pulse 2s ease-in-out infinite",
                }}>
                    start typing to begin playback
                </div>
            )}

            {/* ── Lyrics with dual cursors ────────────────────────────────── */}
            <div ref={textRef} className="typing-text" style={{
                ...textAreaStyle, fontSize: 28, lineHeight: "42px", maxHeight: 400, minHeight: 200, position: "relative",
            }}>
                <div ref={userCursorElRef} style={{
                    position: "absolute", top: 0, left: 0, width: 2.5, background: "#E2B715",
                    borderRadius: 2, transition: "transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)",
                    zIndex: 10, pointerEvents: "none", boxShadow: "0 0 6px rgba(226, 183, 21, 0.5)",
                }} />
                {started && (
                    <div ref={songCursorElRef} style={{
                        position: "absolute", top: 0, left: 0, width: 2.5, background: "#4FC3F7",
                        borderRadius: 2, transition: "transform 0.15s linear", zIndex: 9,
                        pointerEvents: "none", boxShadow: "0 0 6px rgba(79, 195, 247, 0.5)", opacity: 0.85,
                    }} />
                )}
                {(() => {
                    const elements = [];
                    const words = lyricsText.split(" ");
                    let charIdx = 0;
                    words.forEach((word, wi) => {
                        if (wi > 0) {
                            const spaceIdx = charIdx++;
                            const spaceState = charStates[spaceIdx];
                            const isSongAhead = started && songCursor > spaceIdx && spaceState === CHAR_STATE.IDLE;
                            elements.push(
                                <span key={`s${spaceIdx}`} data-idx={spaceIdx} style={{
                                    ...charStyle,
                                    ...(spaceState === CHAR_STATE.CORRECT ? charCorrectStyle : {}),
                                    ...(spaceState === CHAR_STATE.WRONG ? charWrongStyle : {}),
                                    ...(isSongAhead ? { background: "rgba(79, 195, 247, 0.08)" } : {}),
                                }}>{" "}</span>
                            );
                        }
                        const startIdx = charIdx;
                        const charSpans = [];
                        for (let j = 0; j < word.length; j++) {
                            const idx = charIdx++;
                            const state = charStates[idx];
                            const isSongAhead = started && songCursor > idx && state === CHAR_STATE.IDLE;
                            charSpans.push(
                                <span key={idx} data-idx={idx} style={{
                                    ...charStyle,
                                    ...(state === CHAR_STATE.CORRECT ? charCorrectStyle : {}),
                                    ...(state === CHAR_STATE.WRONG ? charWrongStyle : {}),
                                    ...(isSongAhead ? { color: "rgba(79, 195, 247, 0.5)" } : {}),
                                }}>{word[j]}</span>
                            );
                        }
                        elements.push(<span key={`w${startIdx}`} style={{ whiteSpace: "nowrap" }}>{charSpans}</span>);
                    });
                    return elements;
                })()}
            </div>

            {/* ── Bottom controls ─────────────────────────────────────────── */}
            <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: TOKENS.dim, letterSpacing: "0.08em" }}>
                {!started ? (
                    <>esc — <span style={{ color: TOKENS.yellow }}>back to preview</span></>
                ) : (
                    <>
                        esc — <span style={{ color: TOKENS.yellow }}>reset</span>
                        &nbsp;&nbsp;·&nbsp;&nbsp; ctrl+⌫ — <span style={{ color: TOKENS.yellow }}>delete word</span>
                        &nbsp;&nbsp;·&nbsp;&nbsp; ctrl+↵ — <span style={{ color: TOKENS.red }}>end race</span>
                    </>
                )}
            </div>
        </div>
    );
}