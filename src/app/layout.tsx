
import './globals.css';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

import WhoAmI from '@/components/WhoAmI';
export const metadata = {
  title: 'Indussoft',
  description: 'Production Ready Next.js App with MSSQL Integration',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
      <body>{children}
      <ToastContainer />
      </body>
    </html>
  );
}
