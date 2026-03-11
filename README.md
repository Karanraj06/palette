# song-game

A typing game where you race against your own music. Upload any song, and the app transcribes the lyrics with Azure OpenAI Whisper, then challenges you to type along as the song plays. Two cursors — yours and the song's — race through the lyrics in real time.

## How It Works

1. **Upload** an audio file (MP3, WAV, M4A, OGG, WEBM, FLAC — up to 25 MB)
2. **Preview** the transcribed lyrics, edit mistakes, and pick a difficulty
3. **Type** along as the song plays — your cursor (yellow) races the song cursor (blue)
4. **Results** — WPM, accuracy, score, rank, and an error heatmap timeline

## Features

- **Dual-cursor typing** — your typing cursor vs. the song's playback cursor, both visible in real time
- **3 difficulty modes**
  - 🎧 **Chill** — case-insensitive, punctuation stripped
  - 🎤 **Normal** — case-insensitive, punctuation counts
  - 🔥 **Pro** — exact match, everything counts
- **Editable lyrics** — fix transcription mistakes before playing; the preview shows exactly what you'll type based on the selected difficulty
- **Spotify-style audio player** — play/pause, seekable progress bar, time display
- **Scoring system** — 0–1000 score with letter ranks (S through F) based on WPM, accuracy, and speed
- **Error heatmap timeline** — visual breakdown of where you made mistakes across the song
- **End race early** — quit mid-song with `Ctrl+Enter` or the "end race" button; results show completion %
- **Keyboard shortcuts** — `Esc` to reset/go back, `Ctrl+Backspace` to delete a word, `Ctrl+Enter` to end early
- **Auto-language detection** — Whisper detects the song's language automatically (no hardcoded English)
- **Optional GPT lyrics polish** — AI post-processing to fix transcription errors and transliterate non-Latin scripts (requires GPT deployment)
- **LCS-based timeline alignment** — if you edit the lyrics, character timestamps are re-aligned using Longest Common Subsequence matching so the song cursor stays in sync

## Tech Stack

| Layer    | Tech                                     |
|----------|------------------------------------------|
| Frontend | React 19, Vite 7                         |
| Backend  | Express 5, Node.js                       |
| Lyrics transcription       | Azure OpenAI Whisper   |
| Lyrics polish (opt) | Azure OpenAI GPT              |
| Styling  | CSS-in-JS (inline styles)                |

## Prerequisites

- **Node.js** 18+
- **Azure OpenAI resource** with a **Whisper** model deployment
  - Must be a *dedicated* Azure OpenAI resource (not a multi-service AI resource)
- (Optional) A **GPT** model deployment for lyrics polish — can be on the same or a different Azure OpenAI resource

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Azure OpenAI credentials

# Start both frontend and backend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
song-game/
├── server/
│   └── index.js              # Express API — Whisper transcription + GPT polish
├── src/
│   ├── components/
│   │   ├── DifficultySelector.jsx   # Chill / Normal / Pro toggle
│   │   ├── LyricsPreview.jsx        # Edit lyrics + difficulty preview
│   │   ├── SongTypingView.jsx       # Main game — dual cursors, keyboard handler, audio
│   │   ├── SongResultScreen.jsx     # Post-game stats, rank, heatmap
│   │   ├── SongUpload.jsx           # File upload + transcription trigger
│   │   ├── SongHeader.jsx           # Top bar with "new song" button
│   │   ├── PerformanceTimeline.jsx  # Error heatmap visualization
│   │   ├── Footer.jsx               # Page footer
│   │   └── GlobalStyles.jsx         # CSS custom properties + global styles
│   ├── constants/
│   │   ├── charState.js             # IDLE / CORRECT / WRONG enum
│   │   └── tokens.js                # Design tokens (colors, fonts)
│   ├── styles/
│   │   └── appStyles.js             # Shared style objects
│   ├── utils/
│   │   ├── scoring.js               # Score calculation + rank assignment
│   │   └── alignTimeline.js         # LCS-based timeline re-alignment
│   ├── SongGame.jsx                 # Main orchestrator (phase state machine)
│   ├── App.jsx                      # App root
│   └── main.jsx                     # Entry point
├── .env.example
├── package.json
└── vite.config.js                   # Vite config with /api proxy to :3001
```

## API Endpoints

| Method | Endpoint          | Description                    |
|--------|-------------------|--------------------------------|
| POST   | `/api/transcribe` | Upload audio → get lyrics JSON |
| GET    | `/api/health`     | Server health check            |

### `POST /api/transcribe`

- **Body**: `multipart/form-data` with field `audio`
- **Returns**: `{ fullText, words, segments, charTimeline, duration, detectedLanguage, polishWarning }`

## License

MIT