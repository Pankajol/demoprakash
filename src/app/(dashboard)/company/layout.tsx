// "use client";
// import React from 'react';
// import Link from 'next/link';
// import { useState } from "react";
// import { useRouter } from 'next/navigation';

// interface CompanyDashboardLayoutProps {
//   children: React.ReactNode;
// }

// const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const handleImport = async () => {
//     setLoading(true);
//     setMessage(null);

//     try {
//       const res = await fetch("/api/import-data", { method: "POST" });

//       if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(errText || "Import failed");
//       }

//       const json = await res.json();
//       const count = json.imported ?? json.count ?? 0;
//       setMessage(`✅ Imported ${count} rows successfully.`);
//     } catch (err: any) {
//       setMessage(`❌ Import failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleLogout = async () => {
//     try {
//       const res = await fetch('/api/logout', { method: 'POST' });
//       if (res.ok) {
//         router.push('/login');
//       } else {
//         console.error('Logout failed');
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
//       {/* Company Sidebar */}
//       <aside className="w-64 bg-blue-700 text-white p-6">
//         <h2 className="text-2xl font-bold mb-6">Company Panel</h2>
//         <nav className="flex flex-col gap-4">
//           <Link href="/company" className="hover:underline">
//             Home
//           </Link>
//           <Link href="/company/user-registration" className="hover:underline">
//             Manage Users
//           </Link>
//           <Link href="/company/reports" className="hover:underline">
//             Reports
//           </Link>

//           <button
//         onClick={handleImport}
//         disabled={loading}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? "Importing…" : "Import Data"}
//       </button>

//       {message && (
//         <p className="mt-2 text-sm">
//           {message}
//         </p>
//       )}
//         </nav>
//       </aside>

//       {/* Company Main Content */}
//       <div className="flex flex-col flex-1">
//         {/* Company Navbar */}
//         <header className="bg-white shadow p-4 flex items-center justify-between">
//           <h1 className="text-xl font-bold">PharmaTech Solutions - Company</h1>
//           <nav className="flex gap-4">
//             <Link
//               href="/company"
//               className="px-3 py-2 hover:bg-gray-100 rounded"
//             >
//               Dashboard
//             </Link>
//             <Link
//               href="/register?type=user"
//               className="px-3 py-2 hover:bg-gray-100 rounded"
//             >
//               Register User
//             </Link>
//             <button
//               onClick={handleLogout}
//               className="px-3 py-2 hover:bg-gray-100 rounded"
//             >
//               Logout
//             </button>
//           </nav>
//         </header>

//         {/* Page Content */}
//         <main className="p-6 flex-1 bg-gray-50">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default CompanyDashboardLayout;


// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import DownloadPdfButton from '@/components/DownloadPdfButton';
// import Importer from '@/components/Importer';
// import { ToastContainer } from 'react-toastify';

// interface CompanyDashboardLayoutProps {
//   children: React.ReactNode;
// }

// const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const handleImport = async () => {
//     setLoading(true);
//     setMessage(null);

//     try {
//       const res = await fetch('/api/import-data', { method: 'POST' });

//       if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(errText || 'Import failed');
//       }

//       const json = await res.json();
//       const count = json.imported ?? json.count ?? 0;
//       setMessage(`✅ Imported ${count} rows successfully.`);
//     } catch (err: any) {
//       setMessage(`❌ Import failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const res = await fetch('/api/logout', { method: 'POST' });
//       if (res.ok) {
//         router.push('/login');
//       } else {
//         console.error('Logout failed');
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen">
//           {/* Company Navbar */}
//           <header className="sticky top-0 w-full bg-white shadow z-10 p-4 flex items-center justify-between">
//           <h1 className="text-xl font-bold">PharmaTech Solutions - Company</h1>
//           <nav className="flex gap-4">
//             <Link href="/company" className="px-3 py-2 hover:bg-gray-100 rounded">
//               Dashboard
//             </Link>
//             <Link href="/register?type=user" className="px-3 py-2 hover:bg-gray-100 rounded">
//               Register User
//             </Link>
//             <button onClick={handleLogout} className="px-3 py-2 hover:bg-gray-100 rounded">
//               Logout
//             </button>
//             {/* <DownloadPdfButton /> */}
//           </nav>
//         </header>


//       {/* Company Main Content */}
//       <div className="flex flex-1 overflow-hidden">

//            {/* Company Sidebar */}
//            <aside className="w-64 bg-blue-600 text-white p-6 sticky top-0 h-screen overflow-y-auto">
//         <h2 className="text-2xl font-bold mb-6">Company Panel</h2>
//         <nav className="flex flex-col gap-4">
//           <Link href="/company" className="hover:bg-blue-800 rounded p-2 ">
//             Home
//           </Link>
//           <Link href="/company/user-tranjection-summary" className="hover:bg-blue-800 rounded p-2 ">
//             User Tranjection Summary
//           </Link>
//           <Link href="/company/reports" className="hover:bg-blue-800 rounded p-2 ">
//             Reports
//           </Link>
//           <Link href="/company/month-trasactions" className="hover:bg-blue-800 rounded p-2 ">
//             Monthly-Transactions
//           </Link>
//           <Link href="/company/outstanding" className="hover:bg-blue-800 rounded p-2 ">
//             Outstanding-Monthly
//           </Link>
//           <Link href="/company/ledger" className="hover:bg-blue-800 rounded p-2 ">
//             Ledger
//           </Link>


//           <Importer />
//           <ToastContainer position="top-right" autoClose={3000} />
//           <Link href="/company/user-registration" className="hover:bg-blue-800 rounded p-2 ">
//             Manage Users
//           </Link>
//         </nav>
//       </aside>
//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default CompanyDashboardLayout;




'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Importer from '@/components/Importer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DBForm from '@/components/DBForm';
import WhoAmI from '@/components/WhoAmI';

interface CompanyDashboardLayoutProps {
  children: React.ReactNode;
}

const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  // const [dbConnected, setDbConnected] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');  // ← state for dynamic company name

  // On mount, read user object (with companyName) from localStorage
  // const [companyName, setCompanyName] = useState('');
  // On mount: check connection status
  useEffect(() => {
    fetch('/api/connect-local/status')
      .then(res => res.json())
      .then(data => {
        if (data.connected) setDbConnected(true);
      })
      .catch(() => {
        /* Not authenticated or error—keep false */
      })
      .finally(() => setLoadingStatus(false));
  }, []);

  const handleSuccess = () => {
    setDbConnected(true);
    setShowForm(false);
    toast.success('Local DB connected!');
  };
  const handleError = (msg: string) => {
    toast.error(`Connection failed: ${msg}`);
  };



  useEffect(() => {
    // this only runs client‐side
    const raw = localStorage.getItem('user');
    console.log('layout useEffect running…', localStorage.getItem('user'))
    if (raw) {
      const user = JSON.parse(raw);
      if (user.companyName) setCompanyName(user.companyName);
    }
  }, []);
  useEffect(() => {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user.companyName) {
          setCompanyName(user.companyName);
        }
      }
    } catch (err) {
      console.error('Failed to load companyName from localStorage', err);
    }
  }, []);

  const handleImport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/import-data', { method: 'POST' });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Import failed');
      }
      const json = await res.json();
      const count = json.imported ?? json.count ?? 0;
      setMessage(`✅ Imported ${count} rows successfully.`);
    } catch (err: any) {
      setMessage(`❌ Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  // If we’re still loading status, you might render a spinner or nothing:
  if (loadingStatus) return null;
  // While we’re waiting for the status, you could show a spinner or nothing:
  // if (dbConnected === null) return <div>Loading…</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Company Navbar */}
      <header className="sticky top-0 w-full bg-white shadow z-10 p-4 flex items-center justify-between">
        {/* Dynamic company name */}
        <h1 className="text-xl font-bold">
          {companyName} 
        </h1>
        <nav className="flex gap-4">
          <Link href="/company" className="px-3 py-2 hover:bg-gray-100 rounded">
            Dashboard
          </Link>
          <Link
            href="/company/user-registration"
            className="px-3 py-2 hover:bg-gray-100 rounded"
          >
            Register User
          </Link>
          {/* <WhoAmI /> */}
          <button
            onClick={handleLogout}
            className="px-3 py-2 hover:bg-gray-100 rounded"
          >
            Logout
          </button>

        </nav>
      </header>

      {/* Company Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Company Sidebar */}
        <aside className="w-64 bg-blue-600 text-white p-6 sticky top-0 h-screen overflow-y-auto">
          {/* <h2 className="text-2xl font-bold mb-6">Company Panel</h2> */}
          <nav className="flex flex-col gap-4">
            <Link href="/company" className="hover:bg-blue-800 rounded p-2">
              Home
            </Link>
            <Link
              href="/company/user-transection-summary"
              className="hover:bg-blue-800 rounded p-2"
            >
              User Transaction Summary
            </Link>
            {/* <Link
              href="/company/reports"
              className="hover:bg-blue-800 rounded p-2"
            >
              Reports
            </Link> */}
            <Link
              href="/company/month-trasactions"
              className="hover:bg-blue-800 rounded p-2"
            >
              Monthly Transactions
            </Link>
            <Link
              href="/company/outstanding"
              className="hover:bg-blue-800 rounded p-2"
            >
              Outstanding Monthly
            </Link>
            <Link
              href="/company/ledger"
              className="hover:bg-blue-800 rounded p-2"
            >
              Ledger
            </Link>


            {/* {!dbConnected && (
              <button
                onClick={() => setShowForm(f => !f)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
              >
                {showForm ? 'Cancel Connect' : 'Connect Local DB'}
              </button>
            )} */}

            {/* Inline form */}
            {showForm && !dbConnected && (
              <DBForm onSuccess={handleSuccess} onError={handleError} />
            )}

            {/* Importer appears only after connection */}
            {dbConnected && <Importer />}

            {/* ... remaining nav, ToastContainer, etc. */}
            <ToastContainer position="bottom-right" autoClose={3000} />
            {/* <Importer />
            <ToastContainer position="bottom-right" autoClose={3000} /> */}


            <Link
              href="/company/user-registration"
              className="hover:bg-blue-800 rounded p-2"
            >
              Manage Users
            </Link>
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboardLayout;




