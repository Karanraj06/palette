// SongUpload.jsx -- File upload & transcription UI
import { useState, useRef } from "react";
import TOKENS from "../constants/tokens";

export default function SongUpload({ onTranscriptionComplete }) {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState("");
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;

        const allowed = [
            "audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg",
            "audio/webm", "audio/flac", "audio/x-m4a",
        ];
        if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|webm|flac)$/i)) {
            setError("Please upload an audio file (MP3, WAV, M4A, OGG, WEBM, or FLAC)");
            return;
        }

        if (file.size > 4.5 * 1024 * 1024) {
            setError("File size must be under 4.5MB");
            return;
        }

        setError(null);
        setUploading(true);
        setProgress("Uploading audio...");

        try {
            const formData = new FormData();
            formData.append("audio", file);

            setProgress("Transcribing lyrics... (this may take 30-60 seconds)");

            const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Transcription failed");
            }

            const data = await response.json();

            if (!data.fullText || data.fullText.trim().length === 0) {
                throw new Error("No lyrics could be detected. Try a song with clearer vocals.");
            }

            const audioUrl = URL.createObjectURL(file);

            setProgress("Ready!");
            onTranscriptionComplete({
                ...data,
                audioUrl,
                fileName: file.name.replace(/\.[^/.]+$/, ""),
            });
        } catch (err) {
            if (err.message?.includes("413") || err.message?.includes("PAYLOAD_TOO_LARGE")) {
                setError("File too large for the server. Please upload a file under 4.5MB.");
            } else {
                setError(err.message || "Something went wrong. Please try again.");
            }
        } finally {
            setUploading(false);
            setProgress("");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <h1
                style={{
                    fontSize: 48,
                    fontWeight: 300,
                    color: TOKENS.yellow,
                    fontFamily: "'Roboto Mono', monospace",
                    marginBottom: 8,
                }}
            >
                Palette ~
            </h1>
            <p
                style={{
                    fontSize: 14,
                    color: TOKENS.dim,
                    marginBottom: 40,
                    letterSpacing: "0.05em",
                    lineHeight: 1.6,
                }}
            >
                Upload a song · AI extracts the lyrics · Type as the music plays
            </p>

            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragOver ? TOKENS.yellow : "var(--border)"}`,
                    borderRadius: 16,
                    padding: "60px 40px",
                    cursor: uploading ? "wait" : "pointer",
                    transition: "all 0.3s ease",
                    background: dragOver ? "rgba(226, 183, 21, 0.05)" : "transparent",
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                {uploading ? (
                    <div>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🎧</div>
                        <div
                            style={{
                                fontSize: 14,
                                color: TOKENS.yellow,
                                letterSpacing: "0.05em",
                                animation: "pulse 1.5s ease-in-out infinite",
                            }}
                        >
                            {progress}
                        </div>
                        <div
                            style={{
                                marginTop: 16,
                                width: "100%",
                                height: 3,
                                background: "var(--surface)",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    background: TOKENS.yellow,
                                    borderRadius: 2,
                                    animation: "indeterminate 1.5s ease-in-out infinite",
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>🎤</div>
                        <div style={{ fontSize: 16, color: TOKENS.text, marginBottom: 8 }}>
                            Drop your song here or click to browse
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: TOKENS.dim,
                                letterSpacing: "0.05em",
                            }}
                        >
                            MP3, WAV, M4A, OGG, FLAC · Max 4.5MB
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div
                    style={{
                        marginTop: 20,
                        padding: "12px 20px",
                        borderRadius: 8,
                        background: "rgba(255, 80, 80, 0.1)",
                        border: "1px solid rgba(255, 80, 80, 0.3)",
                        color: TOKENS.red,
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
}