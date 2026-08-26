import type { Metadata, Viewport } from 'next';
import { Manrope, Sora } from 'next/font/google';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FCloud 2048 Arena',
  description:
    'A dark, minimal take on the classic FCloud 2048 puzzle — swipe or use arrow keys to merge tiles up to 2048.',
};

export const viewport: Viewport = {
  themeColor: '#201a14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${sora.variable} ${manrope.variable}`}>
      <body className='bg-scene min-h-dvh font-body'>{children}</body>
    </html>
  );
}
