// app/(dashboard)/company/month-trasactions/details/page.js

import React, { Suspense } from 'react';
import DetailsPage from '@/components/DetailsPage'; // Import client component

export default function Page() {
    return (
        <Suspense fallback={<p className="p-4">Loading details...</p>}>
            <DetailsPage className="page" />
        </Suspense>
    );
}




// app/details/page.tsx
// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';

// interface RecordItem {
//   MyType: string;
//   YearId: number;
//   PartyCode: string;
//   Party: string;
//   VAmt: number;
//   AdjAmt: number;
//   IMonth: number;
//   Amt: number;
// }

// export default function DetailsPage() {
//   const searchParams = useSearchParams();
//   const type = searchParams.get('type');
//   const year = searchParams.get('year');
//   const month = searchParams.get('month');

//   const [records, setRecords] = useState<RecordItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!type || !year || !month) {
//       setError('Missing query parameters');
//       setLoading(false);
//       return;
//     }

//     async function fetchDetails() {
//       setLoading(true);
//       try {
//         const params = new URLSearchParams({ type, year, month });
//         const res = await fetch(`/api/aggregate-transactions/details?${params.toString()}`);
//         if (!res.ok) throw new Error(`Error ${res.status}`);
//         const data = await res.json() as RecordItem[];
//         setRecords(data);
//       } catch (err: any) {
//         console.error('Fetch error:', err);
//         setError(err.message || 'Failed to load details');
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchDetails();
//   }, [type, year, month]);

//   if (loading) {
//     return <p className="p-4">Loading details...</p>;
//   }

//   if (error) {
//     return <p className="p-4 text-red-500">Error: {error}</p>;
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-semibold mb-4">
//         Details for {type} – Year {year}, Month {month}
//       </h1>

//       {records.length === 0 ? (
//         <p>No records found.</p>
//       ) : (
//         <div className="overflow-auto">
//           <table className="min-w-full table-auto border-collapse border">
//             <thead>
//               <tr>
//                 <th className="px-4 py-2 border">Type</th>
//                 <th className="px-4 py-2 border">Year</th>
//                 <th className="px-4 py-2 border">Party Code</th>
//                 <th className="px-4 py-2 border">Party Name</th>
//                 <th className="px-4 py-2 border">VAmt</th>
//                 <th className="px-4 py-2 border">AdjAmt</th>
//                 <th className="px-4 py-2 border">Month</th>
//                 <th className="px-4 py-2 border">Amt</th>
//               </tr>
//             </thead>
//             <tbody>
//               {records.map((r, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50">
//                   <td className="px-4 py-2 border">{r.MyType}</td>
//                   <td className="px-4 py-2 border">{r.YearId}</td>
//                   <td className="px-4 py-2 border">{r.PartyCode}</td>
//                   <td className="px-4 py-2 border">{r.Party}</td>
//                   <td className="px-4 py-2 border">{r.VAmt}</td>
//                   <td className="px-4 py-2 border">{r.AdjAmt}</td>
//                   <td className="px-4 py-2 border">{r.IMonth}</td>
//                   <td className="px-4 py-2 border">{r.Amt}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
