// 'use client';

// import React, { useEffect, useState, useMemo } from 'react';
// import { useRouter } from 'next/navigation';
// import { Bar } from 'react-chartjs-2';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import {
//   Chart,
//   CategoryScale,
//   LinearScale,
//   BarController,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartOptions,
//   ChartEvent,
//   ActiveElement
// } from 'chart.js';

// Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

// type TransactionSummary = {
//   MyType: string;
//   Nos: number;
//   Net: number;
// };

// const TransactionsChart: React.FC = () => {
//   const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
//   const [selectedYear, setSelectedYear] = useState<number>();
//   const [fromDate, setFromDate] = useState<Date | null>(new Date());
//   const [toDate, setToDate] = useState<Date | null>(new Date());
//   const [loading, setLoading] = useState<boolean>(false);
//   const [years, setYears] = useState<number[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchYears = async () => {
//       try {
//         const response = await fetch('/api/yearIds');
//         const data = await response.json();
//         const yearsList = data.map((item: { YearId: number }) => item.YearId);
//         setYears(yearsList);
//         if (yearsList.length > 0) setSelectedYear(yearsList[0]);
//       } catch (error) {
//         console.error("Error fetching years:", error);
//       }
//     };
//     fetchYears();
//   }, []);

//   useEffect(() => {
//     const fetchDateRange = async () => {
//       if (!selectedYear) return;
//       setLoading(true);
//       try {
//         const response = await fetch(`/api/get-date-range?yearId=${selectedYear}`);
//         const data = await response.json();
//         if (data.StartDate && data.EndDate) {
//           setFromDate(new Date(data.StartDate));
//           setToDate(new Date(data.EndDate));
//         }
//       } catch (error) {
//         console.error('Error fetching date range:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDateRange();
//   }, [selectedYear]);

//   const fetchTransactions = async () => {
//     if (!fromDate || !toDate) return;
//     setLoading(true);
//     try {
//       const fromDateStr = fromDate.toISOString().split('T')[0];
//       const toDateStr = toDate.toISOString().split('T')[0];
//       const response = await fetch(
//         `/api/transactions?fromDate=${fromDateStr}&toDate=${toDateStr}`,
//         {
//           method: 'GET',
//           credentials: 'include',
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//       const data = await response.json();
//       setTransactions(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error('Error fetching transactions:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTransactions();
//   }, [fromDate, toDate]);

//   const chartData = useMemo(() => {
//     const labels = transactions.map((t) => t.MyType);
//     const counts = transactions.map((t) => t.Nos);
//     const netValues = transactions.map((t) => t.Net);
//     const fromDateStr = fromDate?.toISOString().split('T')[0];
//     const toDateStr = toDate?.toISOString().split('T')[0];

//     return {
//       labels,
//       datasets: [
//         {
//           label: `Transaction Count (${fromDateStr} to ${toDateStr})`,
//           data: counts,
//           backgroundColor: 'rgba(75, 192, 192, 0.4)',
//           borderColor: 'rgba(75, 192, 192, 1)',
//           borderWidth: 1,
//         },
//         {
//           label: `Net Value (${fromDateStr} to ${toDateStr})`,
//           data: netValues,
//           backgroundColor: 'rgba(153, 102, 255, 0.4)',
//           borderColor: 'rgba(153, 102, 255, 1)',
//           borderWidth: 1,
//         },
//       ],
//     };
//   }, [transactions, fromDate, toDate]);

//   const chartOptions: ChartOptions<'bar'> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { position: 'top' },
//       title: { display: true, text: 'Transactions by MyType' },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             const count = chartData.datasets[0].data[context.dataIndex];
//             const netValue = chartData.datasets[1].data[context.dataIndex];
//             return `${context.label}: Count = ${count}, Net = ₹${netValue}`;
//           },
//         },
//       },
//     },
//     onClick: (event: ChartEvent, elements: ActiveElement[]) => {
//       if (elements.length > 0) {
//         const chartIndex = elements[0].index;
//         const clickedType = chartData.labels?.[chartIndex];
//         if (clickedType) {
//           router.push(
//             `company/transactions/${encodeURIComponent(clickedType)}?fromDate=${fromDate?.toISOString().split('T')[0]}&toDate=${toDate?.toISOString().split('T')[0]}`
//           );
//         }
//       }
//     },
//     scales: {
//       x: { title: { display: true, text: 'Transaction Type' } },
//       y: { beginAtZero: true, title: { display: true, text: 'Value / Count' } },
//     },
//   };

//   return (
// <div className="w-full px-1 py-1 sm:px-1 lg:px-8">
//   <div className="bg-white dark:bg-gray-900   p-1 sm:p-1 space-y-1">
//     <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
//       📊 Transactions Overview
//     </h2>

//     {/* Filters */}
//     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//       {/* Year */}
//       <div>
//         <label htmlFor="yearSelect" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
//           Select Year
//         </label>
//         <select
//           id="yearSelect"
//           value={selectedYear ?? ''}
//           onChange={(e) => {
//             const value = parseInt(e.target.value);
//             if (!isNaN(value)) setSelectedYear(value);
//           }}
//           className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="" disabled>Select a year</option>
//           {years.map((year) => (
//             <option key={year} value={year}>{year}</option>
//           ))}
//         </select>
//       </div>

//       {/* From Date */}
//       <div>
//         <label htmlFor="fromDate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
//           From
//         </label>
//         <DatePicker
//           selected={fromDate}
//           onChange={(date: Date | null) => date && setFromDate(date)}
//           dateFormat="dd-MM-yyyy"
//           className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
//           id="fromDate"
//         />
//       </div>

//       {/* To Date */}
//       <div>
//         <label htmlFor="toDate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
//           To
//         </label>
//         <DatePicker
//           selected={toDate}
//           onChange={(date: Date | null) => date && setToDate(date)}
//           dateFormat="dd-MM-yyyy"
//           className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
//           id="toDate"
//         />
//       </div>
//     </div>

//     {/* Chart */}
//     <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
//       {loading ? (
//         <div className="text-center p-6 text-gray-600 dark:text-gray-300 font-medium">Loading chart data...</div>
//       ) : (
//         <div className="min-w-[360px] w-full h-[350px] p-4">
//           <Bar data={chartData} options={chartOptions} />
//         </div>
//       )}
//     </div>
//   </div>
// </div>



//   );
// };

// export default TransactionsChart;

'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

export default function UserLanding() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">👤 Welcome to the User Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">
        This dashboard provides a simple and clean way to manage your stock, check outstanding payments, view ledger details, and more.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <FeatureCard
          title="📦 Stock"
          description="View available products, filter by code or name, and export as PDF/Excel."
          onClick={() => router.push('user/dashboard/stocks')}
        />
        <FeatureCard
          title="📜 Ledger"
          description="See transaction history and ledger entries with date and balance."
          onClick={() => router.push('user/dashboard/ledger')}
        />
        <FeatureCard
          title="💰 Outstanding"
          description="Track all due invoices, customer balances, and follow up easily."
          onClick={() => router.push('user/dashboard/outstanding')}
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-white dark:bg-gray-800 p-5 shadow hover:shadow-lg transition hover:bg-blue-50 dark:hover:bg-gray-700"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

