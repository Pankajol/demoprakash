// app/dashboard/company/page.tsx
"use client"
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TransactionsChart from '@/components/TransactionsChart'
import DetailedTransactionsTable from '@/components/DetailedTransactionsTableUsers';

const CompanyDashboard: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      {/* <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Company Dashboard</h1>
        <p className="mb-6">Welcome, [Company Name]! You are logged in as a company.</p> 
         <div className="mb-4">
          
          <Link
            href="/register?type=user"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Register New User
          </Link>
        </div> 
         <div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div> */}
      <div>
      {/* <h1>My Transactions Dashboard</h1> */}
      {/* <DetailedTransactionsTable /> */}
      <TransactionsChart />
      </div>
    </div>
    </div>
  );
};

export default CompanyDashboard;
