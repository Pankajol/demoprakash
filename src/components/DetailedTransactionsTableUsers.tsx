// Frontend: components/DetailedTransactionsTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type DetailedRow = {
  UsrName: string;
  UsrDate: string;
  MyType: string;
  Nos: number;
  Amt: number;
};

const DetailedTransactionsTable: React.FC = () => {
  const [yearId, setYearId] = useState<number>();
  const [years, setYears] = useState<number[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<DetailedRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available years
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

  // Fetch data when filters change
  useEffect(() => {
    if (!yearId || !fromDate || !toDate) return;
    setLoading(true);
    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    fetch(`/api/user-transactions?yearId=${yearId}&fromDate=${from}&toDate=${to}`)
      .then(res => res.json())
      .then((rows: DetailedRow[]) => {
        // Log fetched rows for debugging
        console.log('Fetched rows:', rows);

        // Normalize numeric fields and ensure strings exist
        const normalized = rows.map(r => ({
          UsrName: r.UsrName ?? 'Unknown',
          UsrDate: r.UsrDate ?? '',
          MyType: r.MyType ?? '',
          Nos: r.Nos ?? 0,
          Amt: r.Amt ?? 0,
        }));
        setData(normalized);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [yearId, fromDate, toDate]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4">
      {/* Controls: Year, From, To */}
      <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
        <div>
          <label className="mr-2">Year:</label>
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
          <label className="mr-2">From:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date: Date | null) => setFromDate(date)}
            dateFormat="dd-MM-yyyy"
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="mr-2">To:</label>
          <DatePicker
            selected={toDate}
            onChange={(date: Date | null) => setToDate(date)}
            dateFormat="dd-MM-yyyy"
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">UsrName</th>
                <th className="px-4 py-2 border">UsrDate</th>
                <th className="px-4 py-2 border">MyType</th>
                <th className="px-4 py-2 border">Nos</th>
                <th className="px-4 py-2 border">Amt</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{row.UsrName}</td>
                  <td className="px-4 py-2 border">{formatDate(row.UsrDate)}</td>
                  <td className="px-4 py-2 border">{row.MyType}</td>
                  <td className="px-4 py-2 border text-right">{row.Nos}</td>
                  <td className="px-4 py-2 border text-right">₹{row.Amt.toFixed(2)}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DetailedTransactionsTable;
