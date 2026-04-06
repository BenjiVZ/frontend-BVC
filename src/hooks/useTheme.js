import { useState, useEffect, useCallback } from 'react';

function getInitialTheme() {
  const stored = localStorage.getItem('bvc-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  // Respect system preference
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bvc-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggle };
}
