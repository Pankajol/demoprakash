/* app/landing/page.tsx */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Importer from '@/components/Importer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Theme detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 space-y-8 transition-colors ${
      isDark
        ? 'bg-gray-900 text-gray-100'
        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
    }`}>
      <ToastContainer position="top-right" autoClose={3000} />

      <header className="text-center space-y-2">
        <h1 className="text-5xl font-extrabold">PharmaTech Solutions</h1>
        <p className="text-xl">Innovative software solutions for the pharmaceutical industry</p>
      </header>

      <main className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Transforming Pharma with Technology</h2>
        <p className="max-w-xl mx-auto">
          Our comprehensive suite of tools is designed to streamline every aspect of your pharmaceutical workflow.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className={`px-6 py-3 rounded-lg shadow-md transition ${
              isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-200'
            }`}
          >
            Register
          </Link>
          <Link
            href="/login"
            className={`px-6 py-3 rounded-lg shadow-md transition ${
              isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-gray-200'
            }`}
          >
            Login
          </Link>
        </div>
      </main>

      {/* Optional CSV importer */}
      {/* <section className="w-full max-w-md">
        <Importer />
      </section> */}

      <footer>
        <p className="text-sm">&copy; 2025 PharmaTech Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;




// 'use client';

// import Link from 'next/link';
// import Importer from '@/components/Importer';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const LandingPage: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white p-6 space-y-8">
//       <header className="text-center space-y-2">
//         <h1 className="text-5xl font-extrabold">PharmaTech Solutions</h1>
//         <p className="text-xl">Innovative software solutions for the pharmaceutical industry</p>
//       </header>

//       <main className="text-center space-y-6">
//         <h2 className="text-3xl font-bold">Transforming Pharma with Technology</h2>
//         <p className="max-w-xl mx-auto">
//           Our comprehensive suite of tools is designed to streamline every aspect of your pharmaceutical workflow.
//         </p>
//         <div className="flex flex-col md:flex-row gap-4 justify-center">
//           <Link href="/register" className="px-6 py-3 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-200 transition">
//             Register
//           </Link>
//           <Link href="/login" className="px-6 py-3 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-200 transition">
//             Login
//           </Link>
//         </div>
//       </main>

//       {/* Importer component for CSV year import */}
//       {/* <section className="w-full max-w-md">
//         <Importer />
//       </section> */}

//       <footer>
//         <p className="text-sm">&copy; 2025 PharmaTech Solutions. All rights reserved.</p>
//       </footer>

//       {/* Toast notifications container */}
//       <ToastContainer />
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default LandingPage;









// dashboard

// 'use client';

// import React, { useState } from 'react';

// export default function TransactionQuery() {
//   // Query parameters
//   const [pCoId, setPCoId] = useState('');
//   const [pYrId, setPYrId] = useState('');
//   const [pFrmDate, setPFrmDate] = useState('');
//   const [pToDate, setPToDate] = useState('');

//   // API response and error state
//   const [responseData, setResponseData] = useState(null);
//   const [error, setError] = useState(null);

//   // Individual column filter states
//   const [filterMyType, setFilterMyType] = useState('');
//   const [filterUsrDate, setFilterUsrDate] = useState('');
//   const [filterPartyCode, setFilterPartyCode] = useState('');
//   const [filterParty, setFilterParty] = useState('');
//   const [filterCityArea, setFilterCityArea] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setResponseData(null);

//     try {
//       const res = await fetch('/api/transection', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ pCoId, pYrId, pFrmDate, pToDate }),
//       });
//       const data = await res.json();
//       setResponseData(data);
//     } catch (err) {
//       console.error('Error fetching API:', err);
//       setError('Failed to fetch transaction data.');
//     }
//   };

//   // Apply individual filters for specific columns
//   const filteredData = responseData?.data
//     ? responseData.data.filter((row) => {
//         return (
//           (!filterMyType ||
//             String(row.MyType).toLowerCase().includes(filterMyType.toLowerCase())) &&
//           (!filterUsrDate ||
//             String(row.UsrDate).toLowerCase().includes(filterUsrDate.toLowerCase())) &&
//           (!filterPartyCode ||
//             String(row.PartyCode).toLowerCase().includes(filterPartyCode.toLowerCase())) &&
//           (!filterParty ||
//             String(row.Party).toLowerCase().includes(filterParty.toLowerCase())) &&
//           (!filterCityArea ||
//             String(row.CityArea).toLowerCase().includes(filterCityArea.toLowerCase()))
//         );
//       })
//     : [];

//   return (
//     <main className="p-8">
//       <h1 className="text-3xl font-bold mb-6">Transaction Details</h1>
//       <form onSubmit={handleSubmit} className="mb-8 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <div>
//             <label htmlFor="pCoId" className="block text-sm font-medium text-gray-700">
//               Company ID
//             </label>
//             <input
//               type="number"
//               id="pCoId"
//               value={pCoId}
//               onChange={(e) => setPCoId(e.target.value)}
//               placeholder="Enter Company ID"
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="pYrId" className="block text-sm font-medium text-gray-700">
//               Year ID
//             </label>
//             <input
//               type="number"
//               id="pYrId"
//               value={pYrId}
//               onChange={(e) => setPYrId(e.target.value)}
//               placeholder="Enter Year ID"
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 "
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="pFrmDate" className="block text-sm font-medium text-gray-700">
//               From Date
//             </label>
//             <input
//               type="date"
//               id="pFrmDate"
//               value={pFrmDate}
//               onChange={(e) => setPFrmDate(e.target.value)}
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="pToDate" className="block text-sm font-medium text-gray-700">
//               To Date
//             </label>
//             <input
//               type="date"
//               id="pToDate"
//               value={pToDate}
//               onChange={(e) => setPToDate(e.target.value)}
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <button
//           type="submit"
//           className="mt-4 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//         >
//           GO
//         </button>
//         </div>
    
//       </form>

//       {responseData && (
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold mb-4">List Of Transactions:</h2>
//           {/* Individual Filter Inputs in Table Header */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 {/* Header Row */}
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MyType</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UsrDate</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PartyCode</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CityArea</th>
//                   {/* Render any additional headers if needed */}
//                   {Object.keys(responseData.data[0])
//                     .filter(key => !["MyType", "UsrDate", "PartyCode", "Party", "CityArea"].includes(key))
//                     .map((key) => (
//                       <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         {key}
//                       </th>
//                     ))}
//                 </tr>
//                 {/* Filter Row */}
//                 <tr>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter MyType"
//                       value={filterMyType}
//                       onChange={(e) => setFilterMyType(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter UsrDate"
//                       value={filterUsrDate}
//                       onChange={(e) => setFilterUsrDate(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter PartyCode"
//                       value={filterPartyCode}
//                       onChange={(e) => setFilterPartyCode(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter Party"
//                       value={filterParty}
//                       onChange={(e) => setFilterParty(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter CityArea"
//                       value={filterCityArea}
//                       onChange={(e) => setFilterCityArea(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   {/* Extra cells for additional columns (empty for filter row) */}
//                   {Object.keys(responseData.data[0])
//                     .filter(key => !["MyType", "UsrDate", "PartyCode", "Party", "CityArea"].includes(key))
//                     .map((key) => (
//                       <th key={key} className="px-6 py-2"></th>
//                     ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredData.map((row, index) => (
//                   <tr key={index}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.MyType}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.UsrDate}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.PartyCode}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Party}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.CityArea}</td>
//                     {Object.keys(row)
//                       .filter(key => !["MyType", "UsrDate", "PartyCode", "Party", "CityArea"].includes(key))
//                       .map((key) => (
//                         <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row[key]}</td>
//                       ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {filteredData.length === 0 && (
//               <p className="text-center text-gray-500 py-4">No records found.</p>
//             )}
//           </div>
//         </div>
//       )}

//       {error && <p className="mt-8 text-red-600">{error}</p>}
//     </main>
//   );
// }


