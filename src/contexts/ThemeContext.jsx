import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "dark",
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
    // Read initial theme preference from local storage
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("practiceTyping-theme");
        if (savedTheme) return savedTheme;

        // Default to dark theme as requested
        return "dark";
    });

    useEffect(() => {
        // Save to local storage whenever theme changes
        localStorage.setItem("practiceTyping-theme", theme);

        // Toggle the .light class on document body or html
        if (theme === "light") {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
