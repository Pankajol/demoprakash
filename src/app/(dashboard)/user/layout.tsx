// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// interface UserDashboardLayoutProps {
//   children: React.ReactNode;
// }

// export default function UserDashboardLayout({
//   children,
// }: UserDashboardLayoutProps) {
//   const router = useRouter();
//   const [userName, setUserName] = useState<string>('');
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     const raw = localStorage.getItem('user');
//     if (raw) {
//       try {
//         const user = JSON.parse(raw);
//         setUserName(user.username || user.userName || '');
//       } catch {}
//     }
//   }, []);

//   const handleLogout = async () => {
//     await fetch('/api/logout', { method: 'POST' });
//     router.push('/login');
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}
//       <header className="sticky top-0 w-full bg-background shadow z-20 p-4 flex items-center justify-between transition-colors">
//         <h1 className="text-xl font-bold text-foreground">
//           {userName ? `${userName} - User Dashboard` : 'User Dashboard'}
//         </h1>
//         {/* Mobile menu button */}
//         <div className="md:hidden">
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="text-foreground border px-3 py-1 rounded"
//           >
//             ☰
//           </button>
//         </div>
//         {/* Desktop nav */}
//         <nav className="hidden md:flex gap-4">
//           <Link
//             href="/user"
//             className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-foreground"
//           >
//             Dashboard
//           </Link>
//           <Link
//             href="/profile"
//             className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-foreground"
//           >
//             Profile
//           </Link>
//           <button
//             onClick={handleLogout}
//             className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-foreground"
//           >
//             Logout
//           </button>
//         </nav>
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Desktop sidebar */}
//         <aside className="hidden md:block w-64 bg-green-600 text-white p-6 overflow-y-auto">
//           <nav className="flex flex-col gap-4">
//             <Link href="/user" className="hover:underline">
//               Home
//             </Link>
//             <Link
//               href="/user/user-transection-summary"
//               className="hover:bg-green-700 rounded p-2"
//             >
//               User Transaction Summary
//             </Link>
//             <Link
//               href="/user/month-trasactions"
//               className="hover:bg-green-700 rounded p-2"
//             >
//               Monthly Transactions
//             </Link>
//             <Link
//               href="/user/outstanding"
//               className="hover:bg-green-700 rounded p-2"
//             >
//               Outstanding Monthly
//             </Link>
//             <Link
//               href="/user/ledger"
//               className="hover:bg-green-700 rounded p-2"
//             >
//               Ledger
//             </Link>
//             <Link
//               href="/user/stocks"
//               className="hover:bg-green-700 rounded p-2"
//             >
//               Stock
//             </Link>
//           </nav>
//         </aside>

//         {/* Mobile sidebar overlay */}
//         {sidebarOpen && (
//           <div
//             className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden"
//             onClick={() => setSidebarOpen(false)}
//           >
//             <aside
//               className="absolute left-0 top-0 h-full w-64 bg-green-600 text-white p-6 z-40"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 className="text-white mb-4"
//                 onClick={() => setSidebarOpen(false)}
//               >
//                 ✕ Close
//               </button>
//               <nav className="flex flex-col gap-4">
//                 <Link
//                   href="/user"
//                   className="hover:bg-green-700 rounded p-2"
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   Dashboard
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="text-left hover:bg-green-700 rounded p-2"
//                 >
//                   Logout
//                 </button>
//                 <hr className="border-white my-2" />
//                 <Link
//                   href="/user/user-transection-summary"
//                   className="hover:bg-green-700 rounded p-2"
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   User Transaction Summary
//                 </Link>
//                 <Link
//                   href="/user/month-trasactions"
//                   className="hover:bg-green-700 rounded p-2"
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   Monthly Transactions
//                 </Link>
//                 <Link
//                   href="/user/outstanding"
//                   className="hover:bg-green-700 rounded p-2"
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   Outstanding Monthly
//                 </Link>
//                 <Link
//                   href="/user/ledger"
//                   className="hover:bg-green-700 rounded p-2"
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   Ledger
//                 </Link>
//                 <Link
//                   href="/user/stocks"
//                   className="hover:bg-green-700 rounded p-2"
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   Stock
//                 </Link>
//               </nav>
//             </aside>
//           </div>
//         )}

//         {/* Main content */}
//         <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 lg:px-8 transition-colors">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }



/* app/user/layout.tsx */
'use client';

import React, { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeToggle from '@/components/ThemeToggle';

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

export default function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // load connection status
  useEffect(() => {
    fetch('/api/connect-local/status')
      .then(res => res.json())
      .then(data => setDbConnected(data.connected ?? false))
      .catch(() => setDbConnected(false))
      .finally(() => setLoadingStatus(false));
  }, []);

  // load userName
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setUserName(user.username || user.userName || '');
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      localStorage.removeItem('user');
      toast.success('Logged out');
      router.push('/login');
    } catch (e) {
      console.error(e);
      toast.error('Logout error');
    }
  };

  if (loadingStatus) return null;

  const navLinks = [
    { href: '/user', label: 'Dashboard' },
    // { href: '/user/profile', label: 'Profile' },
    { href: '/user/user-transection-summary', label: 'Transaction Summary' },
    { href: '/user/month-trasactions', label: 'Monthly Transactions' },
    { href: '/user/outstanding', label: 'Outstanding' },
    { href: '/user/ledger', label: 'Ledger' },
    { href: '/user/stocks', label: 'Stock' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ToastContainer position="top-right" />

      {/* Header */}
      <header className="sticky top-0 w-full bg-white dark:bg-gray-900 shadow z-20 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {userName ? `${userName} - Dashboard` : 'User Dashboard'}
        </h1>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-3 py-1 rounded"
          >
            ☰
          </button>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4">
          <Link href="/user" className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-200">
            Dashboard
          </Link>
          {/* <Link href="/user/profile" className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-200">
            Profile
          </Link> */}
          <button
            onClick={handleLogout}
            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-700 dark:text-gray-200"
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static top-0 left-0 h-full w-64 bg-blue-600 dark:bg-gray-900 text-white p-6 transform transition-transform z-40`}>          
          <button className="text-white mb-4 md:hidden" onClick={() => setSidebarOpen(false)}>
            ✕ Close
          </button>
          <nav className="flex flex-col gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:bg-blue-500 dark:hover:bg-gray-800 rounded p-2"
                onClick={() => setSidebarOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { handleLogout(); setSidebarOpen(false); }}
              className="mt-4 bg-red-500 hover:bg-red-600 rounded p-2"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 transition-colors">
          <ThemeToggle />
          {children}
        </main>
      </div>
    </div>
  );
}
















// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// interface UserDashboardLayoutProps {
//   children: React.ReactNode;
// }

// const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
//   const router = useRouter();
//   const [userName, setUserName] = useState<string>("");
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     const raw = localStorage.getItem("user");
//     if (raw) {
//       try {
//         const user = JSON.parse(raw);
//         if (user.username) {
//           setUserName(user.username);
//         } else if (user.userName) {
//           setUserName(user.userName);
//         }
//       } catch (e) {
//         console.error("Failed to parse user from localStorage", e);
//       }
//     }
//   }, []);

//   const handleLogout = async () => {
//     try {
//       const res = await fetch("/api/logout", { method: "POST" });
//       if (res.ok) {
//         router.push("/login");
//       } else {
//         console.error("Logout failed");
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}
//       <header className="sticky top-0 w-full bg-white shadow z-20 p-4 flex items-center justify-between">
//         <h1 className="text-xl font-bold">
//           {userName ? `${userName} - User Dashboard` : "User Dashboard"}
//         </h1>
//         {/* Mobile menu button */}
//         <div className="md:hidden">
//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="text-gray-700 border px-3 py-1 rounded"
//           >
//             ☰
//           </button>
//         </div>
//         {/* Desktop nav */}
//         <nav className="hidden md:flex gap-4">
//           <Link href="/user" className="px-3 py-2 hover:bg-gray-100 rounded">
//             Dashboard
//           </Link>
//           <Link href="/profile" className="px-3 py-2 hover:bg-gray-100 rounded">
//             Profile
//           </Link>
//           <button
//             onClick={handleLogout}
//             className="px-3 py-2 hover:bg-gray-100 rounded"
//           >
//             Logout
//           </button>
//         </nav>
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Desktop sidebar */}
//         <aside className="hidden md:block w-64 bg-green-600 text-white p-6 overflow-y-auto">
//           <nav className="flex flex-col gap-4">
//             <Link href="/user" className="hover:underline">
//               Home
//             </Link>
//             <Link href="/user/user-transection-summary" className="hover:bg-green-700 rounded p-2">
//               User Transaction Summary
//             </Link>
//             <Link href="/user/month-trasactions" className="hover:bg-green-700 rounded p-2">
//               Monthly Transactions
//             </Link>
//             <Link href="/user/outstanding" className="hover:bg-green-700 rounded p-2">
//               Outstanding Monthly
//             </Link>
//             <Link href="/user/ledger" className="hover:bg-green-700 rounded p-2">
//               Ledger
//             </Link>
//                 <Link href="/user/stocks" className="hover:bg-green-700 rounded p-2">
//                   Stock
//                 </Link>
//           </nav>
//         </aside>

//         {/* Mobile sidebar overlay */}
//         {sidebarOpen && (
//           <div className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)}>
//             <aside
//               className="absolute left-0 top-0 h-full w-64 bg-green-600 text-white p-6 z-40"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button className="text-white mb-4" onClick={() => setSidebarOpen(false)}>
//                 ✕ Close
//               </button>
//               <nav className="flex flex-col gap-4">
//                 {/* Include mobile equivalents of top nav */}
//                 <Link href="/user" className="hover:bg-green-700 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Dashboard
//                 </Link>

//                 <button
//                   onClick={handleLogout}
//                   className="text-left hover:bg-green-700 rounded p-2"
//                 >
//                   Logout
//                 </button>
//                 <hr className="border-white my-2" />
//                 <Link href="/user/user-transection-summary" className="hover:bg-green-700 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   User Transaction Summary
//                 </Link>
//                 <Link href="/user/month-trasactions" className="hover:bg-green-700 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Monthly Transactions
//                 </Link>
//                 <Link href="/user/outstanding" className="hover:bg-green-700 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Outstanding Monthly
//                 </Link>
//                 <Link href="/user/ledger" className="hover:bg-green-700 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Ledger
//                 </Link>
             
//                  <Link href="/user/stocks" className="hover:bg-green-700 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Stock
//                 </Link>
//               </nav>
//             </aside>
//           </div>
//         )}

//         {/* Main content */}
//         <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default UserDashboardLayout;
