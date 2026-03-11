// SongGame.jsx -- Main Song Typing Game Orchestrator
import { useState, useCallback } from "react";
import SongUpload from "./components/SongUpload";
import LyricsPreview from "./components/LyricsPreview";
import SongTypingView from "./components/SongTypingView";
import SongResultScreen from "./components/SongResultScreen";
import Header from "./components/SongHeader";
import Footer from "./components/Footer";
import GlobalStyles from "./components/GlobalStyles";
import { appStyle, mainStyle } from "./styles/appStyles";
import { DIFFICULTIES } from "./components/DifficultySelector";

const PHASE = {
    UPLOAD: "upload",
    PREVIEW: "preview",
    PLAYING: "playing",
    RESULTS: "results",
};

export default function SongGame() {
    const [phase, setPhase] = useState(PHASE.UPLOAD);
    const [songData, setSongData] = useState(null);
    const [results, setResults] = useState(null);
    const [finalCharStates, setFinalCharStates] = useState(null);
    const [charTimeMap, setCharTimeMap] = useState(null);
    const [difficulty, setDifficulty] = useState("pro");

    const handleTranscriptionComplete = useCallback((data) => {
        setSongData(data);
        setPhase(PHASE.PREVIEW);
    }, []);

    const handleLyricsConfirmed = useCallback((editedText) => {
        setSongData((prev) => ({
            ...prev,
            fullText: editedText,
        }));
        setPhase(PHASE.PLAYING);
    }, []);

    const handleGameComplete = useCallback((gameResults) => {
        setResults(gameResults);
        setFinalCharStates(gameResults.charStates);
        setCharTimeMap(gameResults.charTimeMap);
        setPhase(PHASE.RESULTS);
    }, []);

    const handlePlayAgain = useCallback(() => {
        setResults(null);
        setFinalCharStates(null);
        setPhase(PHASE.PLAYING);
    }, []);

    const handleBackToPreview = useCallback(() => {
        setResults(null);
        setFinalCharStates(null);
        setPhase(PHASE.PREVIEW);
    }, []);

    const handleNewSong = useCallback(() => {
        if (songData?.audioUrl) {
            URL.revokeObjectURL(songData.audioUrl);
        }
        setSongData(null);
        setResults(null);
        setFinalCharStates(null);
        setCharTimeMap(null);
        setPhase(PHASE.UPLOAD);
    }, [songData]);

    return (
        <div style={appStyle}>
            <Header onNewSong={handleNewSong} showNewSong={phase !== PHASE.UPLOAD} />

            <main className="typing-main" style={{
                ...mainStyle,
                position: "relative",
                top: "auto",
                left: "auto",
                transform: "none",
            }}>
                {phase === PHASE.UPLOAD && (
                    <SongUpload onTranscriptionComplete={handleTranscriptionComplete} />
                )}

                {phase === PHASE.PREVIEW && songData && (
                    <LyricsPreview
                        lyrics={songData.fullText}
                        onConfirm={handleLyricsConfirmed}
                        difficulty={difficulty}
                        onDifficultyChange={setDifficulty}
                        detectedLanguage={songData.detectedLanguage}
                        polishWarning={songData.polishWarning}
                    />
                )}

                {phase === PHASE.PLAYING && songData && (
                    <SongTypingView
                        songData={songData}
                        onGameComplete={handleGameComplete}
                        difficulty={DIFFICULTIES[difficulty]}
                        onBackToPreview={handleBackToPreview}
                    />
                )}

                {phase === PHASE.RESULTS && results && (
                    <SongResultScreen
                        results={results}
                        onPlayAgain={handlePlayAgain}
                        onNewSong={handleNewSong}
                        charStates={finalCharStates}
                        charTimeMap={charTimeMap}
                    />
                )}
            </main>

            <Footer />
            <GlobalStyles />
        </div>
    );
}