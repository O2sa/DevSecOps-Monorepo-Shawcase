import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth/auth-context';
import { Navigation } from '../components/Navigation';

export const metadata: Metadata = {
  title: 'DevSecOps PoC - Public Web Portal',
  description: 'Public client application for DevSecOps demonstration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          <main className="main-container">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
