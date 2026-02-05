import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';
import { Manrope, DM_Serif_Display } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-body' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], variable: '--font-heading', weight: '400' });

export const metadata: Metadata = {
  title: 'Serenity AI',
  description: 'Personalized AI-guided meditation sessions.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${manrope.variable} ${dmSerif.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
