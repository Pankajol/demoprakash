import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Demoprakash',
  description: 'Production Ready Next.js App with MSSQL Integration',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
