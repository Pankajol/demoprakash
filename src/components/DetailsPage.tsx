// // app/details/page.tsx

// 'use client';

// import React, { useEffect, useState, useMemo } from 'react';
// import { useSearchParams } from 'next/navigation';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// interface RecordItem {
//   MyType: string;
//   YearId: number;
//   VNo: string;
//   PartyCode: string;
//   type: string;
//   VAmt: number;
//   AdjAmt: number;
//   IMonth: number;
//   Amt: number;
//   UsrDate: string;
// }

// const columns: Array<keyof RecordItem> = [
//   'UsrDate','VNo','PartyCode','type','VAmt', 'AdjAmt', 'Amt', 'MyType', 'YearId',     'IMonth'
// ];

// export default function DetailsPage() {
//   const searchParams = useSearchParams();
//   const type = searchParams.get('type') || '';
//   const year = searchParams.get('year') || '';
//   const month = searchParams.get('month') || '';

//   const [records, setRecords] = useState<RecordItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // per-column filters
//   const [filters, setFilters] = useState<Record<string, string>>(
//     columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
//   );
//   const [dateFrom, setDateFrom] = useState<Date | null>(null);
//   const [dateTo, setDateTo] = useState<Date | null>(null);

//   useEffect(() => {
//     if (!type || !year || !month) return;
//     setLoading(true);
//     fetch(`/api/aggregate-transactions/details?type=${type}&year=${year}&month=${month}`)
//       .then(res => {
//         if (!res.ok) throw new Error(`Status ${res.status}`);
//         return res.json();
//       })
//       .then((data: RecordItem[]) => setRecords(data))
//       .catch(err => setError(err.message))
//       .finally(() => setLoading(false));
//   }, [type, year, month]);

//   const filtered = useMemo(() => {
//     return records.filter(r => {
//       // per-column text search
//       for (const col of columns) {
//         const filterVal = filters[col] || '';
//         if (!filterVal) continue;
//         const cell =
//           col === 'UsrDate'
//             ? new Date(r.UsrDate).toLocaleDateString('en-GB')
//             : String((r as any)[col]);
//         if (!cell.toLowerCase().includes(filterVal.toLowerCase())) {
//           return false;
//         }
//       }
//       // date range on UsrDate
//       const recordDate = new Date(r.UsrDate);
//       if (dateFrom && recordDate < dateFrom) return false;
//       if (dateTo && recordDate > dateTo) return false;
//       return true;
//     });
//   }, [records, filters, dateFrom, dateTo]);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

//   return (
//     <div className="p-4 space-y-4">
//       <h1 className="text-xl font-bold">Details for {type} – {year}/{month}</h1>

//       {/* date filters and clear */}
//       <div className="flex flex-wrap gap-4">
//         <DatePicker
//           selected={dateFrom}
//           onChange={setDateFrom}
//           placeholderText="From Date"
//           className="border rounded px-3 py-2"
//           dateFormat="dd-MM-yyyy"
//         />
//         <DatePicker
//           selected={dateTo}
//           onChange={setDateTo}
//           placeholderText="To Date"
//           className="border rounded px-3 py-2"
//           dateFormat="dd-MM-yyyy"
//         />
//         <button
//           onClick={() => {
//             setFilters(columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {}));
//             setDateFrom(null);
//             setDateTo(null);
//           }}
//           className="bg-gray-200 px-4 py-2 rounded"
//         >
//           Clear All
//         </button>
//       </div>

//       {/* table with column filters */}
//       {filtered.length === 0 ? (
//         <p>No records found.</p>
//       ) : (
//         <div className="overflow-auto shadow rounded bg-white">
//           <table className="min-w-full table-auto">
//             <thead className="bg-gray-100">
//               <tr>
//                 {columns.map(col => (
//                   <th key={col} className="px-3 py-2">
//                     <div className="flex flex-col">
//                       <span>{col}</span>
//                       <input
//                         type="text"
//                         value={filters[col]}
//                         onChange={e =>
//                           setFilters(prev => ({ ...prev, [col]: e.target.value }))
//                         }
//                         className="mt-1 border rounded px-1 py-1 text-sm"
//                         placeholder="Filter"
//                       />
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((r, i) => (
//                 <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
//                      <td className="px-3 py-2">
//                     {new Date(r.UsrDate).toLocaleDateString('en-GB')}
//                   </td>
//                   <td className="px-3 py-2">{r.VNo}</td>
//                    <td className="px-3 py-2">{r.PartyCode}</td>
//                    <td className="px-3 py-2">{r.type}</td>
//                     <td className="px-3 py-2 text-right">{r.VAmt}</td>
//                   <td className="px-3 py-2 text-right">{r.AdjAmt}</td>
//                   <td className="px-3 py-2 text-right">{r.VAmt - r.AdjAmt}</td>
//                   <td className="px-3 py-2">{r.MyType}</td>
//                   <td className="px-3 py-2">{r.YearId}</td>
                 
                 
                 
               
//                   <td className="px-3 py-2 text-center">{r.IMonth}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface RecordItem {
  MyType: string;
  YearId: number;
  VNo: string;
  PartyCode: string;
  type: string;
  VAmt: number;
  AdjAmt: number;
  IMonth: number;
  Amt: number;
  UsrDate: string;
}

const columns: Array<keyof RecordItem> = [
  'UsrDate', 'VNo', 'PartyCode', 'type', 'VAmt', 'AdjAmt', 'Amt', 'MyType', 'YearId', 'IMonth',
];

export default function DetailsPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || '';
  const year = searchParams.get('year') || '';
  const month = searchParams.get('month') || '';

  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Record<string, string>>(
    columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
  );

  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  useEffect(() => {
    if (!type || !year || !month) return;
    setLoading(true);
    fetch(`/api/aggregate-transactions/details?type=${type}&year=${year}&month=${month}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: RecordItem[]) => setRecords(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, year, month]);

  const filtered = useMemo(() => {
    return records.filter(r => {
      for (const col of columns) {
        const filterVal = filters[col] || '';
        if (!filterVal) continue;
        const cell =
          col === 'UsrDate'
            ? new Date(r.UsrDate).toLocaleDateString('en-GB')
            : String((r as any)[col]);
        if (!cell.toLowerCase().includes(filterVal.toLowerCase())) {
          return false;
        }
      }
      const recordDate = new Date(r.UsrDate);
      if (dateFrom && recordDate < dateFrom) return false;
      if (dateTo && recordDate > dateTo) return false;
      return true;
    });
  }, [records, filters, dateFrom, dateTo]);

  if (loading) return <p className="p-4 text-gray-700 dark:text-gray-200">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Transaction Details
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div>
          <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">From Date:</label>
          <DatePicker
            selected={dateFrom}
            onChange={(date:any) => setDateFrom(date)}
            className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded w-full dark:bg-gray-800 dark:text-gray-100"
            placeholderText="Select From Date"
              dateFormat="dd-MM-yyyy"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">To Date:</label>
          <DatePicker
            selected={dateTo}
            onChange={(date :any ) => setDateTo(date)}
            className="border border-gray-300 dark:border-gray-600 px-2 py-1 rounded w-full dark:bg-gray-800 dark:text-gray-100"
            placeholderText="Select To Date"
              dateFormat="dd-MM-yyyy"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-2 py-2 text-left text-sm border dark:border-gray-700">
                  {col}
                  <input
                    type="text"
                    value={filters[col]}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [col]: e.target.value }))
                    }
                    className="mt-1 block w-full px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                    placeholder="Filter"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    {col === 'UsrDate'
                      ? new Date(record.UsrDate).toLocaleDateString('en-GB')
                      : (record as any)[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
