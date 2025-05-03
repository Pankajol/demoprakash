
import './globals.css';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

export const metadata = {
  title: 'Demoprakash',
  description: 'Production Ready Next.js App with MSSQL Integration',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}
      <ToastContainer />
      </body>
    </html>
  );
}
