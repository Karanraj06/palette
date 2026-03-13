// server/index.js -- Express backend for Azure OpenAI Whisper transcription + GPT polish
import "dotenv/config";
import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ── Azure OpenAI config ────────────────────────────────────────────────────
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_ENDPOINT = (process.env.AZURE_OPENAI_ENDPOINT || "").replace(/\/+$/, "");
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "whisper";
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-06-01";

// GPT config for lyrics polish (optional — skipped if not configured)
const GPT_DEPLOYMENT = process.env.AZURE_OPENAI_GPT_DEPLOYMENT || "";
const GPT_API_KEY = process.env.AZURE_OPENAI_GPT_API_KEY || AZURE_API_KEY;
const GPT_ENDPOINT = (process.env.AZURE_OPENAI_GPT_ENDPOINT || AZURE_ENDPOINT).replace(/\/+$/, "");
const GPT_API_VERSION = process.env.AZURE_OPENAI_GPT_API_VERSION || "2024-06-01";

if (!AZURE_API_KEY || !AZURE_ENDPOINT) {
    console.error("❌ Missing AZURE_OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT in .env");
    console.error("   You need a DEDICATED Azure OpenAI resource (not a multi-service AI resource).");
    console.error("   Create one at: https://portal.azure.com → Create resource → Azure OpenAI");
    process.exit(1);
}

const WHISPER_URL = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/audio/transcriptions?api-version=${AZURE_API_VERSION}`;

app.use(express.json());

const ALLOWED_ORIGINS = new Set([
    "https://get-palette.vercel.app",
]);

if (process.env.NODE_ENV !== "production") {
    ALLOWED_ORIGINS.add("http://localhost:5173");
}

app.use("/api", (req, res, next) => {
    const origin = req.get("Origin");

    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return res.status(403).json({ error: "Forbidden" });
    }

    if (req.get("X-Requested-With") !== "palette-client") {
        return res.status(403).json({ error: "Forbidden" });
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();

    next();
});

// ── Multer storage config ──────────────────────────────────────────────────
// Vercel only allows writes to /tmp. os.tmpdir() works everywhere.
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".flac"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error("Only audio files are allowed"));
    },
});

// ── GPT lyrics polish helper ────────────────────────────────────────────────
async function polishLyrics(words) {
    if (!GPT_DEPLOYMENT) {
        return { polishedWords: null, polishWarning: null };
    }

    const GPT_URL = `${GPT_ENDPOINT}/openai/deployments/${GPT_DEPLOYMENT}/chat/completions?api-version=${GPT_API_VERSION}`;
    const wordList = words.map((w) => w.word);

    try {
        console.log(`🔤 Polishing lyrics with GPT (${words.length} words)...`);

        const response = await axios.post(GPT_URL, {
            messages: [
                {
                    role: "system",
                    content: `You are a lyrics correction assistant for a typing game. You will receive a JSON array of words from an audio transcription. Your job:

1. Fix obvious transcription errors (misheard words, gibberish)
2. Convert non-Latin script words to their romanized/transliterated form (e.g., Hindi → romanized Hindi like "dil" instead of "दिल")
3. Replace hard-to-type special characters with simpler alternatives
4. Keep contractions natural (don't → don't, I'm → I'm)
5. CRITICAL: Return EXACTLY the same number of words. Each word maps 1:1 to the input.
6. CRITICAL: Do NOT merge or split words. Do NOT add or remove words.
7. If a word is fine, keep it unchanged.

Return ONLY a JSON array of strings with the corrected words. No explanation.`
                },
                {
                    role: "user",
                    content: JSON.stringify(wordList)
                }
            ],
            temperature: 0.1,
            max_tokens: 4000,
        }, {
            headers: {
                "api-key": GPT_API_KEY,
                "Content-Type": "application/json",
            },
            timeout: 30000,
        });

        const content = response.data.choices?.[0]?.message?.content?.trim();
        if (!content) {
            return { polishedWords: null, polishWarning: "GPT returned empty response" };
        }

        let polished;
        try {
            polished = JSON.parse(content);
        } catch {
            return { polishedWords: null, polishWarning: "GPT returned invalid JSON" };
        }

        if (!Array.isArray(polished) || polished.length !== words.length) {
            return {
                polishedWords: null,
                polishWarning: `GPT returned ${polished?.length ?? 0} words instead of ${words.length} — using original`
            };
        }

        const polishedWords = words.map((w, i) => ({
            word: String(polished[i]),
            start: w.start,
            end: w.end,
        }));

        const changedCount = polished.filter((p, i) => p !== wordList[i]).length;
        console.log(`✨ GPT polished ${changedCount}/${words.length} words`);

        return { polishedWords, polishWarning: null };
    } catch (err) {
        console.warn("⚠️ GPT polish failed:", err.message);
        return { polishedWords: null, polishWarning: `GPT polish failed: ${err.message}` };
    }
}

// ── POST /api/transcribe ───────────────────────────────────────────────────
app.post("/api/transcribe", (req, res) => {
    upload.single("audio")(req, res, async (err) => {
        // ── Multer errors ──────────────────────────────────────────────
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({ error: "File too large. Maximum size is 25MB." });
            }
            return res.status(400).json({ error: err.message });
        }
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        const filePath = req.file.path;

        try {
            let transcription = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const form = new FormData();
                    form.append("file", fs.createReadStream(filePath), {
                        filename: `audio${path.extname(req.file.originalname).toLowerCase()}`,
                        contentType: req.file.mimetype,
                    });
                    form.append("response_format", "verbose_json");
                    form.append("timestamp_granularities[]", "word");
                    form.append("timestamp_granularities[]", "segment");

                    const response = await axios.post(WHISPER_URL, form, {
                        headers: {
                            ...form.getHeaders(),
                            "api-key": AZURE_API_KEY,
                        },
                        maxContentLength: 30 * 1024 * 1024,
                        maxBodyLength: 30 * 1024 * 1024,
                        timeout: 180000,
                    });

                    transcription = response.data;
                    break;
                } catch (error) {
                    if (error.response?.status === 429 && attempt < 3) {
                        const wait = parseInt(error.response.headers?.["retry-after"], 10) || 25;
                        console.log(`⏳ Rate limited. Waiting ${wait}s...`);
                        await new Promise((r) => setTimeout(r, wait * 1000));
                        continue;
                    }
                    throw error;
                }
            }

            if (!transcription) throw new Error("All retry attempts exhausted");

            const detectedLanguage = transcription.language || "en";

            // ── Extract words ──────────────────────────────────────────────
            let words = [];
            if (transcription.words && transcription.words.length > 0) {
                words = transcription.words.map((w) => ({
                    word: w.word, start: w.start, end: w.end,
                }));
            } else if (transcription.segments) {
                for (const seg of transcription.segments) {
                    if (seg.words) {
                        for (const w of seg.words) {
                            words.push({ word: w.word, start: w.start, end: w.end });
                        }
                    }
                }
            }

            const segments = (transcription.segments || []).map((seg) => ({
                text: seg.text.trim(), start: seg.start, end: seg.end,
            }));

            // ── GPT polish (optional) ──────────────────────────────────────
            const { polishedWords, polishWarning } = await polishLyrics(words);
            const finalWords = polishedWords || words;

            const fullText = finalWords.map((w) => w.word).join(" ");

            // ── Character-level timeline ───────────────────────────────────
            const charTimeline = [];
            for (const word of finalWords) {
                const dur = word.end - word.start;
                for (let i = 0; i < word.word.length; i++) {
                    const frac = word.word.length > 1 ? i / (word.word.length - 1) : 0;
                    charTimeline.push({
                        char: word.word[i],
                        time: word.start + dur * frac,
                        wordStart: word.start, wordEnd: word.end,
                    });
                }
                charTimeline.push({
                    char: " ", time: word.end,
                    wordStart: word.start, wordEnd: word.end,
                });
            }
            if (charTimeline.length > 0 && charTimeline.at(-1).char === " ") {
                charTimeline.pop();
            }

            const duration = transcription.duration ||
                (finalWords.length > 0 ? finalWords.at(-1).end : 0);

            console.log(`✅ ${finalWords.length} words, ${duration.toFixed(1)}s, lang=${detectedLanguage}`);
            res.json({
                fullText,
                words: finalWords,
                segments,
                charTimeline,
                duration,
                detectedLanguage,
                polishWarning,
            });

        } catch (error) {
            console.error("❌ Error:", error.response?.data || error.message);

            let errorMessage = "Transcription failed";
            let statusCode = 500;

            if (error.response) {
                statusCode = error.response.status;
                const errData = error.response.data?.error || error.response.data;

                if (statusCode === 401) {
                    errorMessage = "API key is invalid.";
                } else if (errData?.code === "DeploymentNotFound" || statusCode === 404) {
                    errorMessage = "Transcription service not available. Please try again later.";
                } else if (statusCode === 429) {
                    errorMessage = "Rate limited. Wait ~30 seconds and try again.";
                } else {
                    errorMessage = "Transcription failed. Please try again.";
                }
            }

            res.status(statusCode >= 400 ? statusCode : 500).json({
                error: errorMessage,
            });
        } finally {
            try { fs.unlinkSync(filePath); } catch { }
        }
    });
});

// ── Server startup ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Palette ~ server running on http://localhost:${PORT}`);
    console.log(`GPT polish: ${GPT_DEPLOYMENT ? "enabled" : "disabled"}`);
});

// ── Production static file serving ─────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));

    app.get("/{*path}", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}