import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevSecOps PoC - Public Web Portal',
  description: 'Public client application for DevSecOps demonstration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="main-container">
          {children}
        </main>
      </body>
    </html>
  );
}
