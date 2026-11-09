import React from 'react';

const PATHS = {
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 16l-5-5-8 8" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.5 11h11L21 7H7" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </>
  ),
  draw: (
    <>
      <path d="M4 20l1-5L16 4l4 4L9 19z" />
      <path d="M14 6l4 4" />
    </>
  ),
  pencil: <path d="M4 20l1-5L16 4l4 4L9 19z" />,
  erase: (
    <>
      <path d="M9 20h11" />
      <path d="M4 15l9-9 6 6-8 8H8z" />
      <path d="M9 10l6 6" />
    </>
  ),
  fill: (
    <>
      <path d="M5 11l7-7 7 7-7 7z" />
      <path d="M3 11h16" />
      <path d="M20 15c0 0 1.8 2.2 1.8 3.4a1.8 1.8 0 0 1-3.6 0C18.2 17.2 20 15 20 15z" />
    </>
  ),
  undo: (
    <>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </>
  ),
  redo: (
    <>
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H10a6 6 0 0 0 0 12h3" />
    </>
  ),
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 12l5 5 9-10" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  work: <path d="M4 6h10M4 12h10M4 18h10M17 6l1.5 1.5L21 5M17 12l1.5 1.5L21 11" />,
  grid: (
    <>
      <rect x="4" y="4" width="16" height="16" />
      <path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16" />
    </>
  ),
  fullscreen: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  reset: <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" />,
  warning: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v5M12 18v.5" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
} as const;

export type IconName = keyof typeof PATHS | 'more';

interface Props {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export default function Icon({ name, size = 18, strokeWidth = 2, color, className }: Props) {
  if (name === 'more') {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color ?? 'currentColor'}
        className={className}
      >
        <rect x="10.5" y="4" width="3" height="3" />
        <rect x="10.5" y="10.5" width="3" height="3" />
        <rect x="10.5" y="17" width="3" height="3" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
