import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { IamProvider } from '../contexts/IamContext';

export const ThemeContext = createContext({
    dark: false,
    setDark: () => {},
    toggleDark: () => {},
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => localStorage.getItem('iam-theme') === 'dark');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('iam-theme', dark ? 'dark' : 'light');
    }, [dark]);

    const toggleDark = () => setDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ dark, setDark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function AppProviders({ children }) {
    return (
        <ThemeProvider>
            <IamProvider>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </IamProvider>
        </ThemeProvider>
    );
}

export default AppProviders;
