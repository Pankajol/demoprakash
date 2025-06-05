// "use client"
// import DetailedTransactionsTable from '@/components/DetailedTransactionsTableUsers'
// import React from 'react'

// function page() {
//   return (
//     <div>
//       <DetailedTransactionsTable />
     
//     </div>
//   )
// }


// useEffect(() => {
//   fetch('/api/yearIds')
//     .then(res => res.json())
//     .then((list: { YearId: number }[]) => {
//       const ys = list.map(y => y.YearId);
//       setYears(ys);
//       if (ys.length) setYearId(ys[0]);
//     })
//     .catch(console.error);
// }, []);

// export default page

'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DetailedRow {
  UsrName: string;
  UsrDate: string;
  MyType: string;
  Nos: number;
  Amt: number;
}

interface ImportRow {
  MyType: string;
  VNo: string;
  ItemNo: number;
  UsrDate: string;
  PartyCode: string;
  Party: string;
  CityArea: string;
  VAmt: number;
  AdjAmt: number;
  AdjIds: string;
  Trading: number;
  TradingLed: string;
  YearId: number;
  UsrName: string;
  EditMode: string;
  EditUpdate: string;
  CDF: string;
  WebpCompanyId: string;
  DrTypeId: number;
  CrTypeId: number;
}

const DetailedTransactionsTable: React.FC = () => {
  const [yearId, setYearId] = useState<number>();
  const [years, setYears] = useState<number[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<DetailedRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Expansion and import details
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<ImportRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/yearIds')
      .then(res => res.json())
      .then((list: { YearId: number }[]) => {
        const ys = list.map(y => y.YearId);
        setYears(ys);
        if (ys.length) setYearId(ys[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!yearId || !fromDate || !toDate) return;
    setLoading(true);
    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    fetch(`/api/user-transactions?yearId=${yearId}&fromDate=${from}&toDate=${to}`)
      .then(res => res.json())
      .then((rows: DetailedRow[]) => {
        setData(rows.map(r => ({
          ...r,
          UsrName: r.UsrName || 'Unknown',
          UsrDate: r.UsrDate || '',
          MyType: r.MyType || '',
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [yearId, fromDate, toDate]);

  // const formatDate = (isoStr: string) => {
  //   try {
  //     return new Date(isoStr).toLocaleDateString();
  //   } catch {
  //     return isoStr;
  //   }
  // };

  const formatForQuery = (dateStr: string) => {
    const date = new Date(dateStr);
    const parts = date
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .split(' ');
    return `${parts[0]}-${parts[1].toUpperCase()}-${parts[2]}`;
  };

  const handleRowClick = (row: DetailedRow, idx: number) => {
    if (expandedIndex === idx) {
      // collapse if same row clicked
      setExpandedIndex(null);
      return;
    }
    setExpandedIndex(idx);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedDetails([]);

    const usrDateQuery = formatForQuery(row.UsrDate);
    fetch(
      `/api/daily-trans-import?UsrName=${encodeURIComponent(row.UsrName)}` +
      `&UsrDate=${encodeURIComponent(usrDateQuery)}` +
      `&MyType=${encodeURIComponent(row.MyType)}`
    )
      .then(res => {
        if (res.status === 404) {
          setDetailError('No import records found for this transaction.');
          setDetailLoading(false);
          return null;
        }
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((details: ImportRow[] | null) => {
        if (details) setSelectedDetails(details);
      })
      .catch(err => {
        console.error(err);
        setDetailError('Failed to load import details.');
      })
      .finally(() => setDetailLoading(false));


    
  };

    function formatISTDateTime(utcStr) {
  const date = new Date(utcStr);
  const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const pad = (n) => n.toString().padStart(2, '0');
  const ms = istDate.getMilliseconds().toString().padStart(3, '0');

  return `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(istDate.getDate())} ${pad(istDate.getHours())}:${pad(istDate.getMinutes())}:${pad(istDate.getSeconds())}.${ms}`;
}

  return (
    // <div className="p-4">
    //   <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
    //     {/* Year, From, To controls */}
    //     <div>
    //       <label className="mr-2">Year:</label>
    //       <select
    //         value={yearId}
    //         onChange={e => setYearId(+e.target.value)}
    //         className="border rounded px-2 py-1"
    //       >
    //         {years.map(y => (
    //           <option key={y} value={y}>{y}</option>
    //         ))}
    //       </select>
    //     </div>
    //     <div>
    //       <label className="mr-2">From:</label>
    //       <DatePicker
    //         selected={fromDate}
    //         onChange={(date:Date | null) => setFromDate(date)}
    //         dateFormat="dd-MM-yyyy"
    //         className="border rounded px-2 py-1"
    //       />
    //     </div>
    //     <div>
    //       <label className="mr-2">To:</label>
    //       <DatePicker
    //         selected={toDate}
    //         onChange={(date:Date | null) => setToDate(date)}
    //         dateFormat="dd-MM-yyyy"
    //         className="border rounded px-2 py-1"
    //       />
    //     </div>
    //   </div>

    //   {loading ? (
    //     <div className="text-center py-10">Loading...</div>
    //   ) : (
    //     <div className="overflow-x-auto">
    //       <table className="min-w-full table-auto border-collapse">
    //         <thead>
    //           <tr className="bg-gray-100">
    //             <th className="px-4 py-2 border">UsrName</th>
    //             <th className="px-4 py-2 border">UsrDate</th>
    //             <th className="px-4 py-2 border">MyType</th>
    //             <th className="px-4 py-2 border">Nos</th>
    //             <th className="px-4 py-2 border">Amt</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {data.map((row, idx) => (
    //             <React.Fragment key={idx}>
    //               <tr
    //                 className="hover:bg-gray-50 cursor-pointer"
    //                 onClick={() => handleRowClick(row, idx)}
    //               >
    //                 <td className="px-4 py-2 border">{row.UsrName}</td>
    //                 <td className="px-4 py-2 border">{new Date(row.UsrDate).toLocaleDateString()}</td>
    //                 <td className="px-4 py-2 border">{row.MyType}</td>
    //                 <td className="px-4 py-2 border text-right">{row.Nos}</td>
    //                 <td className="px-4 py-2 border text-right">₹{row.Amt.toFixed(2)}</td>
    //               </tr>
    //               {expandedIndex === idx && (
    //                 <tr>
    //                   <td colSpan={5} className="bg-gray-50 p-4">
    //                     {detailLoading ? (
    //                       <div>Loading import details...</div>
    //                     ) : detailError ? (
    //                       <div className="text-red-500">{detailError}</div>
    //                     ) : selectedDetails.length > 0 ? (
    //                       <table className="min-w-full table-auto border-collapse">
    //                         <thead>
    //                           <tr className="bg-gray-200">
    //                             <th className="px-2 py-1 border">VNo</th>
    //                             <th className="px-2 py-1 border">Party</th>
    //                             <th className="px-2 py-1 border">CityArea</th>
    //                             <th className="px-2 py-1 border text-right">VAmt</th>
    //                             <th className="px-2 py-1 border text-right">AdjAmt</th>
    //                             <th className="px-2 py-1 border">EditMode</th>
    //                             <th className="px-2 py-1 border">EditUpdate</th>
    //                           </tr>
    //                         </thead>
    //                         <tbody>
    //                           {selectedDetails.map((d, i) => (
    //                             <tr key={i} className="hover:bg-gray-100">
    //                               <td className="px-2 py-1 border">{d.VNo}</td>
    //                               <td className="px-2 py-1 border">{d.Party}</td>
    //                               <td className="px-2 py-1 border">{d.CityArea.trim()}</td>
    //                               <td className="px-2 py-1 border text-right">₹{d.VAmt.toFixed(2)}</td>
    //                               <td className="px-2 py-1 border text-right">₹{d.AdjAmt.toFixed(2)}</td>
    //                               <td className="px-2 py-1 border">{d.EditMode}</td>
    //                               <td className="px-2 py-1 border">{new Date(d.EditUpdate).toLocaleString()}</td>
    //                             </tr>
    //                           ))}
    //                         </tbody>
    //                       </table>
    //                     ) : null}
    //                   </td>
    //                 </tr>
    //               )}
    //             </React.Fragment>
    //           ))}
    //         </tbody>
    //       </table>
    //     </div>
    //   )}
    // </div>





    <div className="min-h-screen bg-gray-100 p-6">
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <h1 className="text-xl font-bold">User Report</h1>
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mr-2 font-medium">Year:</label>
          <select
            value={yearId}
            onChange={e => setYearId(+e.target.value)}
            className="border rounded px-2 py-1"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium">From:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date: Date | null) => setFromDate(date)}
            dateFormat="dd-MM-yyyy"
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="mr-2 font-medium">To:</label>
          <DatePicker
            selected={toDate}
            onChange={(date: Date | null) => setToDate(date)}
            dateFormat="dd-MM-yyyy"
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>

    {loading ? (
      <div className="text-center py-10">Loading...</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border text-left">UsrName</th>
              <th className="px-4 py-2 border text-left">UsrDate</th>
              <th className="px-4 py-2 border text-left">MyType</th>
              <th className="px-4 py-2 border text-right">Nos</th>
              <th className="px-4 py-2 border text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(row, idx)}
                >
                  <td className="px-4 py-2 border">{row.UsrName}</td>
                  <td className="px-4 py-2 border">
                    {new Date(row.UsrDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-2 border">{row.MyType}</td>
                  <td className="px-4 py-2 border text-right">{row.Nos}</td>
                  <td className="px-4 py-2 border text-right">₹{row.Amt.toFixed(2)}</td>
                </tr>
                {expandedIndex === idx && (
                  <tr>
                    <td colSpan={5} className="bg-gray-50 p-4">
                      {detailLoading ? (
                        <div>Loading import details...</div>
                      ) : detailError ? (
                        <div className="text-red-500">{detailError}</div>
                      ) : selectedDetails.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full table-auto border-collapse text-sm">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="px-2 py-1 border">VNo</th>
                                <th className="px-2 py-1 border">Party</th>
                                <th className="px-2 py-1 border">CityArea</th>
                                <th className="px-2 py-1 border text-right">VAmt</th>
                                <th className="px-2 py-1 border text-right">AdjAmt</th>
                                <th className="px-2 py-1 border">EditMode</th>
                                <th className="px-2 py-1 border">EditUpdate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDetails.map((d, i) => (
                                <tr key={i} className="hover:bg-gray-100">
                                  <td className="px-2 py-1 border">{d.VNo}</td>
                                  <td className="px-2 py-1 border">{d.Party}</td>
                                  <td className="px-2 py-1 border">{d.CityArea.trim()}</td>
                                  <td className="px-2 py-1 border text-right">₹{d.VAmt.toFixed(2)}</td>
                                  <td className="px-2 py-1 border text-right">₹{d.AdjAmt.toFixed(2)}</td>
                                  <td className="px-2 py-1 border">{d.EditMode}</td>
                               
                                {/*<td className="px-2 py-1 border">{new Date(d.EditUpdate).toLocaleDateString('en-GB',{
                                     day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
                                  })}</td> */}
                                 <td className="px-2 py-1 border">{d.EditUpdate.toString()}</td>
                                 
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div>No details found.</div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>

  );
};

export default DetailedTransactionsTable;


