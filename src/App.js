import React, { useState, createContext, useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import './App.css';
import WalletCard from './components/WalletCard';

export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {}
});

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button
      onClick={toggleTheme}
      className={`fixed top-4 right-4 p-2 rounded-full ${
        isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'
      } transition-colors`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-blue-400" />
      )}
    </button>
  );
};

function App() {
  const [isDark, setIsDark] = useState(true);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={`App ${isDark ? 'dark' : 'light'}`}>
        <ThemeToggle />
        <WalletCard />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
