/* app/company/layout.tsx */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeToggle from '@/components/ThemeToggle';

interface CompanyDashboardLayoutProps {
  children: React.ReactNode;
}

const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // Theme detection
  const [isDark, setIsDark] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // load connection status
  useEffect(() => {
    fetch('/api/connect-local/status')
      .then(res => res.json())
      .then(data => setDbConnected(data.connected ?? false))
      .catch(() => setDbConnected(false))
      .finally(() => setLoadingStatus(false));
  }, []);

  // load companyName
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setCompanyName(user.companyName || '');
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (!res.ok) throw new Error();
      localStorage.removeItem('user');
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (loadingStatus) return null;

  const navLinks = [
    { href: '/company', label: 'Dashboard' },
    { href: '/company/user-registration', label: 'Register User' },
    { href: '/company/user-transection-summary', label: 'Transaction Summary' },
    { href: '/company/month-trasactions', label: 'Monthly Transactions' },
    { href: '/company/outstanding', label: 'Outstanding' },
    { href: '/company/ledger', label: 'Ledger' },
    { href: '/company/stocks', label: 'Stock' },
    { href: '/company/inward-rates', label: 'Inward Rates' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header className="sticky top-0 w-full bg-white dark:bg-gray-900 shadow z-20 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {companyName ? `${companyName} Dashboard` : 'Company Dashboard'}
        </h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            className="md:hidden text-gray-700 dark:text-gray-200 border rounded px-2 py-1"
            onClick={() => setSidebarOpen(o => !o)}
          >
            ☰
          </button>
          <nav className="hidden md:flex gap-4">
            <Link href="/company" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
              Dashboard
            </Link>
            <Link href="/company/user-registration" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200">
              Register User
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static top-0 left-0 h-full w-64 bg-blue-600 dark:bg-gray-900 text-white p-6 transform transition-transform z-40`}>
          <button className="text-white mb-4 md:hidden" onClick={() => setSidebarOpen(false)}>✕ Close</button>
          <nav className="flex flex-col gap-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded p-2 hover:bg-blue-500 dark:hover:bg-gray-800"
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
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboardLayout;






// "use client";

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import ThemeToggle from '@/components/ThemeToggle';

// interface CompanyDashboardLayoutProps {
//   children: React.ReactNode;
// }

// const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
//   const router = useRouter();
//   const [companyName, setCompanyName] = useState<string>('');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [dbConnected, setDbConnected] = useState<boolean | null>(null);
//   const [loadingStatus, setLoadingStatus] = useState(true);

//   // load connection status
//   useEffect(() => {
//     fetch('/api/connect-local/status')
//       .then(res => res.json())
//       .then(data => {
//         if (data.connected) setDbConnected(true);
//       })
//       .catch(() => {})
//       .finally(() => setLoadingStatus(false));
//   }, []);

//   // load companyName from localStorage
//   useEffect(() => {
//     const raw = localStorage.getItem('user');
//     if (raw) {
//       try {
//         const user = JSON.parse(raw);
//         if (user.companyName) setCompanyName(user.companyName);
//       } catch (e) {
//         console.error('Failed to parse user:', e);
//       }
//     }
//   }, []);

//   const handleLogout = async () => {
//     try {
//       const res = await fetch('/api/logout', { method: 'POST' });
//       if (res.ok) router.push('/login');
//       else console.error('Logout failed');
//     } catch (e) {
//       console.error('Logout error:', e);
//     }
//   };

//   if (loadingStatus) return null;

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}
//       <header className="sticky top-0 w-full bg-white dark:bg-gray-900 shadow z-20 p-4 flex items-center justify-between">
//         <h1 className="text-xl  font-bold ">
//           {companyName ? `${companyName} - Dashboard` : 'Company Dashboard'}
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
//           <Link href="/company" className="px-3 py-2 hover:bg-gray-100 rounded">
//             Dashboard
//           </Link>
//           <Link href="/company/user-registration" className="px-3 py-2 hover:bg-gray-100 rounded">
//             Register User
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
//         <aside className="hidden md:block w-64 bg-blue-600 text-white p-6 overflow-y-auto">
//           <nav className="flex flex-col gap-4">
//             <Link href="/company" className="hover:underline">
//               Dashboard
//             </Link>
//             <Link href="/company/user-registration" className="hover:bg-blue-800 rounded p-2">
//               Register User
//             </Link>
//             <Link href="/company/user-transection-summary" className="hover:bg-blue-800 rounded p-2">
//               User Transaction Summary
//             </Link>
//             <Link href="/company/month-trasactions" className="hover:bg-blue-800 rounded p-2">
//               Monthly Transactions
//             </Link>
//             <Link href="/company/outstanding" className="hover:bg-blue-800 rounded p-2">
//               Outstanding Monthly
//             </Link>
//             <Link href="/company/ledger" className="hover:bg-blue-800 rounded p-2">
//               Ledger
//             </Link>
//             <Link href="/company/stocks" className="hover:bg-blue-800 rounded p-2">
//               Stock
//             </Link>
//                 <Link href="/company/inward-rates" className="hover:bg-blue-800 rounded p-2">
//                   Inward-Rate
//                 </Link>
          
//           </nav>
//         </aside>

//         {/* Mobile sidebar overlay */}
//         {sidebarOpen && (
//           <div className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)}>
//             <aside
//               className="absolute left-0 top-0 h-full w-64 bg-blue-600 text-white p-6 z-40"
//               onClick={e => e.stopPropagation()}
//             >
//               <button className="text-white mb-4" onClick={() => setSidebarOpen(false)}>
//                 ✕ Close
//               </button>
//               <nav className="flex flex-col gap-4">
//                 <Link href="/company" className="hover:bg-blue-800 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Dashboard
//                 </Link>
//                 <Link href="/company/user-registration" className="hover:bg-blue-800 rounded p-2 " onClick={() => setSidebarOpen(false)}>
//                   Register User
//                 </Link>
//                 <Link href="/company/user-transection-summary" className="hover:bg-blue-800 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   User Transaction Summary
//                 </Link>
//                 <Link href="/company/month-trasactions" className="hover:bg-blue-800 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Monthly Transactions
//                 </Link>
//                 <Link href="/company/outstanding" className="hover:bg-blue-800 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Outstanding Monthly
//                 </Link>
//                 <Link href="/company/ledger" className="hover:bg-blue-800 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Ledger
//                 </Link>
//                 <Link href="/company/stocks" className="hover:bg-blue-800 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Stock
//                 </Link>
//                   <Link href="/company/inward-rates" className="hover:bg-blue-800 rounded p-2" onClick={() => setSidebarOpen(false)}>
//                   Inward-Rate
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="text-left hover:bg-blue-800 rounded p-2"
//                 >
//                   Logout
//                 </button>
//               </nav>
//             </aside>
//           </div>
//         )}

//      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
//       <ThemeToggle />
//   {children}
// </main>
//       </div>
//     </div>
//   );
// };

// export default CompanyDashboardLayout;

