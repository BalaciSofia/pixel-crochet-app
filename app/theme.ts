'use client';

import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

export const theme = createTheme({
  palette: {
    primary: {
      main: tokens.rose,
      light: tokens.petal,
      dark: tokens.roseDark,
      contrastText: tokens.white,
    },
    secondary: {
      main: tokens.cherry,
      light: '#D4546B',
      dark: tokens.cherryDark,
      contrastText: tokens.white,
    },
    error: {
      main: tokens.cherry,
    },
    success: {
      main: tokens.success,
    },
    text: {
      primary: tokens.ink,
      secondary: tokens.muted,
      disabled: tokens.disabled,
    },
    background: {
      default: tokens.paper,
      paper: tokens.white,
    },
    divider: tokens.line,
    action: {
      hover: tokens.blush,
      disabled: tokens.disabled,
    },
  },
  shape: {
    borderRadius: 2,
  },
  typography: {
    fontFamily: tokens.fontSans,
    body1: { fontSize: 14, lineHeight: 1.5 },
    body2: { fontSize: 13, lineHeight: 1.5 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: 14,
    },
  },
  components: {
    MuiPaper: {
      defaultProps: { square: true },
      styleOverrides: {
        rounded: { borderRadius: 0 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 0, borderColor: tokens.line },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `1px solid ${tokens.ink}`,
          boxShadow: tokens.shadowDialog,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          '&:not(.MuiBackdrop-invisible)': { backgroundColor: 'rgba(30, 26, 28, 0.4)' },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `1px solid ${tokens.line}`,
          boxShadow: tokens.shadowFloat,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 0, backgroundColor: tokens.lineSoft },
        bar: { borderRadius: 0 },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { borderRadius: 0 },
        grouped: { borderRadius: 0 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          fontWeight: 500,
          color: tokens.ink,
          borderColor: tokens.line,
          '&:hover': { backgroundColor: tokens.blush },
          '&.Mui-selected': {
            backgroundColor: tokens.ink,
            color: tokens.white,
            fontWeight: 600,
            '&:hover': { backgroundColor: tokens.ink },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 0 },
      },
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 2,
          minHeight: 44,
          padding: '0 18px',
          whiteSpace: 'nowrap',
        },
        sizeSmall: {
          minHeight: 36,
          padding: '0 12px',
          fontSize: 13,
        },
        sizeLarge: {
          minHeight: 48,
          padding: '0 24px',
          fontSize: 16,
        },
        outlined: {
          fontWeight: 500,
          backgroundColor: tokens.white,
          '&:hover': { backgroundColor: tokens.blush },
        },
        text: {
          '&:hover': { backgroundColor: tokens.blush },
        },
        contained: {
          '&.Mui-disabled': { backgroundColor: tokens.line, color: '#6F6468' },
        },
      },
      variants: [
        {
          props: { variant: 'outlined', color: 'inherit' },
          style: { borderColor: tokens.ink, color: tokens.ink },
        },
        {
          props: { variant: 'text', color: 'inherit' },
          style: { fontWeight: 500 },
        },
      ],
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '&:hover': { backgroundColor: tokens.blush },
          '&.Mui-disabled': { color: tokens.disabled },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: tokens.white,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.lineInput },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.muted },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.rose,
            borderWidth: 2,
          },
        },
        input: {
          padding: '11px 12px',
        },
        sizeSmall: {
          '& .MuiOutlinedInput-input': { padding: '9px 10px' },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 44,
          height: 24,
          padding: 0,
          overflow: 'visible',
        },
        switchBase: {
          padding: 3,
          color: tokens.white,
          '&:hover': { backgroundColor: 'transparent' },
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: tokens.white,
            '& + .MuiSwitch-track': { backgroundColor: tokens.rose, opacity: 1 },
          },
          '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.5 },
          '&.Mui-focusVisible': { outline: `2px solid ${tokens.rose}`, outlineOffset: 2 },
        },
        thumb: {
          width: 18,
          height: 18,
          borderRadius: 0,
          boxShadow: 'none',
        },
        track: {
          borderRadius: 0,
          backgroundColor: '#C9BCC2',
          opacity: 1,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.line },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: { borderRadius: 0, backgroundColor: tokens.ink, fontSize: 12 },
        arrow: { color: tokens.ink },
      },
    },
  },
});
