"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
  // Dynamic user name from localStorage
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  

  useEffect(() => {
    // Only runs in client
    const raw = localStorage.getItem('user');
    console.log('UserDashboardLayout useEffect raw user:', raw);
    if (raw) {
      try {
        const user = JSON.parse(raw);
        // adjust field name according to your payload, e.g. user.username or user.userName
        if (user.username) {
          setUserName(user.username);
        } else if (user.userName) {
          setUserName(user.userName);
        }
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }, []);

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

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="sticky top-0 w-full bg-white shadow z-10 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {userName ? `${userName} - User Dashboard` : 'User Dashboard'}
        </h1>
        <nav className="flex gap-4">
          <Link href="/user" className="px-3 py-2 hover:bg-gray-100 rounded">
            Dashboard
          </Link>
          <Link href="/profile" className="px-3 py-2 hover:bg-gray-100 rounded">
            Profile
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
        {/* Sticky Sidebar */}
        <aside className="w-64 bg-green-600 text-white p-6 sticky top-0 h-screen overflow-y-auto">
          {/* <h2 className="text-2xl font-bold mb-6">User Panel</h2> */}
          <nav className="flex flex-col gap-4">
            <Link href="/user" className="hover:underline">
              Home
            </Link>
            {/* <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <Link href="/user/support" className="hover:underline">
              Support
            </Link> */}
            <Link
              href="/user/user-transection-summary"
              className="hover:bg-blue-800 rounded p-2"
            >
              User Transaction Summary
            </Link>
            {/* <Link
              href="/user/reports"
              className="hover:bg-blue-800 rounded p-2"
            >
              Reports
            </Link> */}
            <Link
              href="/user/month-trasactions"
              className="hover:bg-blue-800 rounded p-2"
            >
              Monthly Transactions
            </Link>
            <Link
              href="/user/outstanding"
              className="hover:bg-blue-800 rounded p-2"
            >
              Outstanding Monthly
            </Link>
            <Link
              href="/user/ledger"
              className="hover:bg-blue-800 rounded p-2"
            >
              Ledger
            </Link>
            {/* <button
              onClick={() => console.log('Import Data clicked')}
              className="mt-4 bg-white text-green-600 px-4 py-2 rounded hover:bg-gray-100"
            >
              Import Data
            </button> */}
          </nav>
        </aside>

        {/* Main Content Scrolls */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;


// "use client";

// import React, { useState, useEffect } from 'react';
// import Link from "next/link";

// interface UserDashboardLayoutProps {
//   children: React.ReactNode;
// }

//   const [userName, setUserName] = useState<string>('');  // ← state for dynamic company name

//   // On mount, read user object (with companyName) from localStorage
//   // const [companyName, setCompanyName] = useState('');

//   useEffect(() => {
//     // this only runs client‐side
//     const raw = localStorage.getItem('user');
//     console.log('layout useEffect running…', localStorage.getItem('user'))
//     if (raw) {
//       const user = JSON.parse(raw);
//       if (user.userName) setUserName(user.userName);
//     }
//   }, []);

// const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
//   return (
//     <div className="flex flex-col h-screen">
//       {/* Fixed Header */}
//       <header className="sticky top-0 w-full bg-white shadow z-10 p-4 flex items-center justify-between">
//         <h1 className="text-xl font-bold">{userName}-of company</h1>
//         <nav className="flex gap-4">
//           <Link href="/user" className="px-3 py-2 hover:bg-gray-100 rounded">Dashboard</Link>
//           <Link href="/profile" className="px-3 py-2 hover:bg-gray-100 rounded">Profile</Link>
//           <Link href="/login" className="px-3 py-2 hover:bg-gray-100 rounded">Logout</Link>
//         </nav>
//       </header>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Sticky Sidebar */}
//         <aside className="w-64 bg-green-600 text-white p-6 sticky top-0 h-screen overflow-y-auto">
//           <h2 className="text-2xl font-bold mb-6">User Panel</h2>
//           <nav className="flex flex-col gap-4">
//             <Link href="/user" className="hover:underline">Home</Link>
//             <Link href="/profile" className="hover:underline">Profile</Link>
//             <Link href="/user/support" className="hover:underline">Support</Link>
//             <Link href="/user/outstanding" className="hover:underline">
//             Outstanding-Monthly
//           </Link>
//           <Link href="/user/ledger" className="hover:underline">
//             Ledger
//           </Link>
//             <button>Import Data</button>
//           </nav>
//         </aside>

//         {/* Main Content Scrolls */}
//         <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default UserDashboardLayout;
