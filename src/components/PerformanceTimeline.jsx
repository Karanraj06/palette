// PerformanceTimeline.jsx -- Visual timeline of user vs song progress
import { useMemo } from "react";
import TOKENS from "../constants/tokens";

export default function PerformanceTimeline({ charStates, charTimeMap, duration }) {
    // Sample the user's progress at regular intervals vs the song's progress
    const timelineData = useMemo(() => {
        if (!charTimeMap || !duration) return [];

        const BUCKETS = 50; // Number of timeline segments
        const bucketDuration = duration / BUCKETS;
        const data = [];

        for (let i = 0; i < BUCKETS; i++) {
            const time = (i + 0.5) * bucketDuration;

            // How far the song is at this time (as a %)
            let songIdx = 0;
            for (let j = 0; j < charTimeMap.length; j++) {
                if (charTimeMap[j] <= time) songIdx = j + 1;
                else break;
            }
            const songPct = (songIdx / charTimeMap.length) * 100;

            // Count errors in this time window's character range
            const startChar = Math.floor((i / BUCKETS) * charStates.length);
            const endChar = Math.floor(((i + 1) / BUCKETS) * charStates.length);
            let errors = 0;
            for (let j = startChar; j < endChar; j++) {
                if (charStates[j] === "wrong") errors++;
            }

            data.push({ time, songPct, errors, bucket: i });
        }

        return data;
    }, [charStates, charTimeMap, duration]);

    if (timelineData.length === 0) return null;

    const maxErrors = Math.max(1, ...timelineData.map((d) => d.errors));

    return (
        <div style={{ marginTop: 24 }}>
            <div style={{
                fontSize: 10,
                color: TOKENS.dim,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 8,
                textAlign: "center",
            }}>
                Error Heatmap
            </div>
            <div style={{
                display: "flex",
                height: 24,
                borderRadius: 4,
                overflow: "hidden",
                border: `1px solid var(--border)`,
            }}>
                {timelineData.map((d) => {
                    const intensity = d.errors / maxErrors;
                    const bg = d.errors === 0
                        ? "var(--surface)"
                        : `rgba(202, 71, 84, ${0.15 + intensity * 0.7})`;
                    return (
                        <div
                            key={d.bucket}
                            title={`${Math.round(d.time)}s: ${d.errors} errors`}
                            style={{
                                flex: 1,
                                background: bg,
                                transition: "background 0.2s",
                                cursor: "default",
                            }}
                        />
                    );
                })}
            </div>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                color: TOKENS.dim,
                marginTop: 4,
            }}>
                <span>0:00</span>
                <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}</span>
            </div>
        </div>
    );
}