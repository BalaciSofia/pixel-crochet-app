'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#B24A74',
      light: '#D48FAA',
      dark: '#9A3F63',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#B3243F',
      light: '#D4546B',
      dark: '#8F1B32',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    background: {
      default: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});
