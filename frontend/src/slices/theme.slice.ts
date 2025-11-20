import { createSlice } from '@reduxjs/toolkit';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
}

const THEME_KEY = 'app_theme';

// Load theme from localStorage
const loadInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme;
    return stored || 'system';
  } catch (error) {
    return 'system';
  }
};

const initialState: ThemeState = {
  theme: loadInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const theme = action.payload as Theme;
      state.theme = theme;
      localStorage.setItem(THEME_KEY, theme);

      // Apply theme to DOM
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
