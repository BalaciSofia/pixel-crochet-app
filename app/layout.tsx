import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Pattern Studio',
  description: 'Create beautiful crochet tapestry patterns with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
