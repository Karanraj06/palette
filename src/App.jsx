import SongGame from "./SongGame";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
    return (
        <ThemeProvider>
            <SongGame />
        </ThemeProvider>
    );
}

export default App;