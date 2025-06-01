// 'use client';

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import Importer from '@/components/Importer';
// import DBForm from '@/components/DBForm';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// interface CompanyDashboardLayoutProps {
//   children: React.ReactNode;
// }

// const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
//   const router = useRouter();
//   const [showForm, setShowForm] = useState(false);
//   const [dbConnected, setDbConnected] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingStatus, setLoadingStatus] = useState(true);
//   const [message, setMessage] = useState<string | null>(null);
//   const [companyName, setCompanyName] = useState<string>('');
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     fetch('/api/connect-local/status')
//       .then(res => res.json())
//       .then(data => {
//         if (data.connected) setDbConnected(true);
//       })
//       .catch(() => {})
//       .finally(() => setLoadingStatus(false));
//   }, []);

//   useEffect(() => {
//     try {
//       const userJson = localStorage.getItem('user');
//       if (userJson) {
//         const user = JSON.parse(userJson);
//         if (user.companyName) {
//           setCompanyName(user.companyName);
//         }
//       }
//     } catch (err) {
//       console.error('Failed to load companyName from localStorage', err);
//     }
//   }, []);

//   const handleLogout = async () => {
//     try {
//       const res = await fetch('/api/logout', { method: 'POST' });
//       if (res.ok) router.push('/login');
//       else console.error('Logout failed');
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   if (loadingStatus) return null;

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Navbar */}
//       <header className="sticky top-0 z-20 bg-white shadow p-4 flex items-center justify-between md:justify-between">
//         <h1 className="text-xl font-bold">{companyName}</h1>
//         <button
//           onClick={() => setSidebarOpen(prev => !prev)}
//           className="md:hidden text-gray-600 focus:outline-none"
//         >
//           ☰
//         </button>
//         <nav className="hidden md:flex gap-4">
//           <Link href="/company" className="px-3 py-2 hover:bg-gray-100 rounded">Dashboard</Link>
//           <Link href="/company/user-registration" className="px-3 py-2 hover:bg-gray-100 rounded">Register User</Link>
//           <button onClick={handleLogout} className="px-3 py-2 hover:bg-gray-100 rounded">Logout</button>
//         </nav>
//       </header>

//       {/* Layout */}
//       <div className="flex flex-1 overflow-hidden">
//         <aside className={`
//           bg-blue-600 text-white w-64 p-6 overflow-y-auto z-30
//           fixed md:static h-full top-0 left-0 transition-transform duration-300
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
//         `}>
//           {/* Close button for mobile */}
//           <button
//             className="text-white mb-4 md:hidden"
//             onClick={() => setSidebarOpen(false)}
//           >
//             ✕ Close
//           </button>

//           <nav className="flex flex-col gap-4">
//             <Link href="/company" className="hover:bg-blue-800 rounded p-2">Dashboard</Link>
//             <Link href="/company/user-registration" className="hover:bg-blue-800 rounded p-2">Register User</Link>
//             <button onClick={handleLogout} className="text-left hover:bg-blue-800 rounded p-2">Logout</button>
//             <hr className="border-white/30 my-2" />
//             <Link href="/company/user-transection-summary" className="hover:bg-blue-800 rounded p-2">User Transaction Summary</Link>
//             <Link href="/company/month-trasactions" className="hover:bg-blue-800 rounded p-2">Monthly Transactions</Link>
//             <Link href="/company/outstanding" className="hover:bg-blue-800 rounded p-2">Outstanding Monthly</Link>
//             <Link href="/company/ledger" className="hover:bg-blue-800 rounded p-2">Ledger</Link>
//             <Link href="/company/stocks" className="hover:bg-blue-800 rounded p-2">Stock</Link>

//           </nav>
//           <ToastContainer position="bottom-right" autoClose={3000} />
//         </aside>

//         <main className="flex-1 overflow-y-auto bg-gray-50 p-6 ml-0 md:ml-64">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default CompanyDashboardLayout;



"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CompanyDashboardLayoutProps {
  children: React.ReactNode;
}

const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // load connection status
  useEffect(() => {
    fetch('/api/connect-local/status')
      .then(res => res.json())
      .then(data => {
        if (data.connected) setDbConnected(true);
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  }, []);

  // load companyName from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user.companyName) setCompanyName(user.companyName);
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) router.push('/login');
      else console.error('Logout failed');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  if (loadingStatus) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 w-full bg-white shadow z-20 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {companyName ? `${companyName} - Dashboard` : 'Company Dashboard'}
        </h1>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 border px-3 py-1 rounded"
          >
            ☰
          </button>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4">
          <Link href="/company" className="px-3 py-2 hover:bg-gray-100 rounded">
            Dashboard
          </Link>
          <Link href="/company/user-registration" className="px-3 py-2 hover:bg-gray-100 rounded">
            Register User
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-2 hover:bg-gray-100 rounded"
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 bg-blue-600 text-white p-6 overflow-y-auto">
          <nav className="flex flex-col gap-4">
            <Link href="/company" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/company/user-registration" className="hover:bg-blue-800 rounded p-2">
              Register User
            </Link>
            <Link href="/company/user-transection-summary" className="hover:bg-blue-800 rounded p-2">
              User Transaction Summary
            </Link>
            <Link href="/company/month-trasactions" className="hover:bg-blue-800 rounded p-2">
              Monthly Transactions
            </Link>
            <Link href="/company/outstanding" className="hover:bg-blue-800 rounded p-2">
              Outstanding Monthly
            </Link>
            <Link href="/company/ledger" className="hover:bg-blue-800 rounded p-2">
              Ledger
            </Link>
            <Link href="/company/stocks" className="hover:bg-blue-800 rounded p-2">
              Stock
            </Link>
                <Link href="/company/inward-rates" className="hover:bg-blue-800 rounded p-2">
                  Inward-Rate
                </Link>
          
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)}>
            <aside
              className="absolute left-0 top-0 h-full w-64 bg-blue-600 text-white p-6 z-40"
              onClick={e => e.stopPropagation()}
            >
              <button className="text-white mb-4" onClick={() => setSidebarOpen(false)}>
                ✕ Close
              </button>
              <nav className="flex flex-col gap-4">
                <Link href="/company" className="hover:bg-blue-800 rounded p-2">
                  Dashboard
                </Link>
                <Link href="/company/user-registration" className="hover:bg-blue-800 rounded p-2">
                  Register User
                </Link>
                <Link href="/company/user-transection-summary" className="hover:bg-blue-800 rounded p-2">
                  User Transaction Summary
                </Link>
                <Link href="/company/month-trasactions" className="hover:bg-blue-800 rounded p-2">
                  Monthly Transactions
                </Link>
                <Link href="/company/outstanding" className="hover:bg-blue-800 rounded p-2">
                  Outstanding Monthly
                </Link>
                <Link href="/company/ledger" className="hover:bg-blue-800 rounded p-2">
                  Ledger
                </Link>
                <Link href="/company/stocks" className="hover:bg-blue-800 rounded p-2">
                  Stock
                </Link>
                  <Link href="/company/inward-rates" className="hover:bg-blue-800 rounded p-2">
                  Inward-Rate
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left hover:bg-blue-800 rounded p-2"
                >
                  Logout
                </button>
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboardLayout;

