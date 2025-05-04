// app/dashboard/user/page.tsx
"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import TransactionsChart from '@/components/TransactionsChart'

const UserDashboard: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        {/* <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
        <p className="mb-6">Welcome, [User Name]! You are logged in as a user.</p>
        <div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button> 
        </div> */}
<h1>My Transactions Dashboard</h1>
<TransactionsChart />
       
      </div>
    </div>
  );
};

export default UserDashboard;
