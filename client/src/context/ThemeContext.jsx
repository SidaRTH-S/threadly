import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("threadly-theme") ||
      "system"
    );
  });

  const [systemDark, setSystemDark] = useState(() => {
    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
  });

  // Detect system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = (event) => {
      setSystemDark(event.matches);
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
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem(
      "threadly-theme",
      theme
    );
  }, [theme]);

  // Apply theme to HTML
  useEffect(() => {
    const actualTheme =
      theme === "system"
        ? systemDark
          ? "dark"
          : "light"
        : theme;

    document.documentElement.setAttribute(
      "data-theme",
      actualTheme
    );
  }, [theme, systemDark]);

  // Toggle light / dark
  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(systemDark ? "light" : "dark");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // Return to automatic system theme
  const useSystemTheme = () => {
    setTheme("system");
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" && systemDark);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        useSystemTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
