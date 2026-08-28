import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
);

const STORAGE_KEY = "note-insight-theme";

export function ThemeProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem(STORAGE_KEY);

        if (
            savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system"
        ) {
            return savedTheme;
        }

        return "dark";
    });

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = () => {
            root.classList.remove(
                "theme-light",
                "theme-dark"
            );

            let activeTheme: "light" | "dark";

            if (theme === "system") {
                activeTheme = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
                    ? "dark"
                    : "light";
            } else {
                activeTheme = theme;
            }

            root.classList.add(`theme-${activeTheme}`);

            root.setAttribute(
                "data-theme",
                activeTheme
            );
        };

        applyTheme();

        localStorage.setItem(
            STORAGE_KEY,
            theme
        );

        // Listen for Windows/browser theme changes
        if (theme === "system") {
            const mediaQuery = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

            const handleChange = () => {
                applyTheme();
            };

            mediaQuery.addEventListener(
                "change",
                handleChange
            );

            return () => {
                mediaQuery.removeEventListener(
                    "change",
                    handleChange
                );
            };
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}