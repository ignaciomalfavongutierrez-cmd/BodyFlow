import { ref } from 'vue';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bodyflow-theme';

const isDark = ref(true);

export function useTheme() {
  function applyTheme(dark: boolean) {
    isDark.value = dark;
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved === 'dark');
      return;
    }

    // Auto-detect system / laptop color scheme preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);

    // Listen to OS theme changes if user has not manually set a preference
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          applyTheme(e.matches);
        }
      });
    }
  }

  function toggleTheme() {
    const nextState = !isDark.value;
    applyTheme(nextState);
    localStorage.setItem(THEME_STORAGE_KEY, nextState ? 'dark' : 'light');
  }

  function setTheme(mode: ThemeMode) {
    applyTheme(mode === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme
  };
}
