'use client';

import { CssVarsProvider, extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          solidBg: '#9333ea',
          solidHoverBg: '#7e22ce',
          solidActiveBg: '#6b21a8',
          softBg: '#f3e8ff',
          softHoverBg: '#e9d5ff',
          softColor: '#7e22ce',
          outlinedBorder: '#c084fc',
          outlinedColor: '#7e22ce',
          outlinedHoverBg: '#faf5ff',
          plainColor: '#9333ea',
          plainHoverBg: '#faf5ff',
        },
      },
    },
  },
});

export default function JoyThemeProvider({ children }) {
  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="light"
      disableTransitionOnChange
      modeStorageKey="roomgrub-mode"
      colorSchemeStorageKey="roomgrub-color-scheme"
    >
      {children}
    </CssVarsProvider>
  );
}
