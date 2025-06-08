import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css'; 

export const metadata = {
  title: 'Indussoft',
  description: 'Production Ready Next.js App with MSSQL Integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen transition-colors duration-300">
        <header className="flex items-center justify-between p-4">
          {/* <h1 className="text-2xl font-bold">My Project</h1> */}
         
        </header>
        <main className="p-4">
           {/* <ThemeToggle /> */}
          {children}</main>
            <ToastContainer />
      </body>
    </html>
  );
}




// import './globals.css';
// import { ReactNode } from 'react';
// import { ToastContainer } from 'react-toastify';
// import ThemeToggle from '../components/ThemeToggle';
// import 'react-toastify/dist/ReactToastify.css'; 

// import WhoAmI from '@/components/WhoAmI';
// export const metadata = {
  // title: 'Indussoft',
  // description: 'Production Ready Next.js App with MSSQL Integration',
// };

// export default function RootLayout({ children }: { children: ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//   <meta name="viewport" content="width=device-width, initial-scale=1" />
// </head>
//       <body>
//           <ThemeToggle />
//         {children}
        
//       <ToastContainer />
//       </body>
//     </html>
//   );
// }
