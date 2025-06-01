/* app/stock/page.tsx */
'use client';

import React, { useEffect, useState } from 'react';

interface StockItem {
  code: number;
  itemName: string;
  pack: string;
  qty: number;
  ptr: number;
  mrp: number;
  mfgName: string;
}

export default function StockPage() {
  const [data, setData] = useState<StockItem[]>([]);
  const [filtered, setFiltered] = useState<StockItem[]>([]);
  const [codeFilter, setCodeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/stock');
        if (!res.ok) throw new Error('Failed to fetch');
        const json: StockItem[] = await res.json();
        setData(json);
        setFiltered(json);
      } catch (err) {
        console.error('Error loading stock:', err);
      }
    }
    loadData();
  }, []);

  function handleFilter() {
    const byCode = codeFilter.trim() === ''
      ? data
      : data.filter(item => item.code === parseInt(codeFilter.trim(), 10));

    const bySearch = searchTerm.trim() === ''
      ? byCode
      : byCode.filter(item =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.mfgName.toLowerCase().includes(searchTerm.toLowerCase())
        );

    setFiltered(bySearch);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Stock Listing</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col">
          <label htmlFor="code" className="mb-1 text-sm font-medium">Code</label>
          <input
            id="code"
            type="text"
            value={codeFilter}
            onChange={e => setCodeFilter(e.target.value)}
            placeholder="e.g. 116"
            className="border rounded px-3 py-2 w-32"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="search" className="mb-1 text-sm font-medium">Product / Manufacturer</label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="enter name"
            className="border rounded px-3 py-2 w-64"
          />
        </div>

        <button
          onClick={handleFilter}
          className="self-end bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded"
        >
          GO
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 border text-left">Code</th>
              <th className="px-3 py-2 border text-left">Product </th>
              <th className="px-3 py-2 border text-left">Pack</th>
              <th className="px-3 py-2 border text-right">Qty</th>
              <th className="px-3 py-2 border text-right">PTR</th>
              <th className="px-3 py-2 border text-right">MRP</th>
              <th className="px-3 py-2 border text-left">Manufacturer</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 border">{item.code}</td>
                  <td className="px-3 py-2 border">{item.itemName} </td>
                    <td className="px-3 py-2 border"> {item.pack}</td>
                  <td className="px-3 py-2 border text-right">{item.qty}</td>
                  <td className="px-3 py-2 border text-right">{item.ptr}</td>
                  <td className="px-3 py-2 border text-right">{item.mrp}</td>
                  <td className="px-3 py-2 border">{item.mfgName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
