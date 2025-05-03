'use client';

import React, { useState } from 'react';
import Select from 'react-select';

const myTypeOptions = [
  { label: 'Cash Receipt', value: 'cashr' },
  { label: 'Cash Payment', value: 'cashp' },
  { label: 'Slip Receipt', value: 'slipr' },
  { label: 'Cheque Payment', value: 'chqpe' },
];

export default function OutstandingPage() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [fromDate, setFromDate] = useState('2023-04-01');
  const [toDate, setToDate] = useState('2024-03-31');
  const [partyCode, setPartyCode] = useState('');
  const [partyName, setPartyName] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (selectedTypes.length === 0) return alert('Select at least one MyType');

    const typeParams = selectedTypes.map((t) => `myTypes=${t.value}`).join('&');

    let url = `/api/outstanding?${typeParams}&fromDate=${fromDate}&toDate=${toDate}`;
    if (partyCode) url += `&partyCode=${partyCode}`;
    if (partyName) url += `&party=${partyName}`;

    setLoading(true);
    try {
      const res = await fetch(url);
      const rows = await res.json();
      setData(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Search Outstanding</h1>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">MyType(s)</label>
          <Select
            isMulti
            options={myTypeOptions}
            value={selectedTypes}
            onChange={(opts) => setSelectedTypes([...opts])}
            placeholder="Select MyTypes"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Party Code</label>
          <input
            type="text"
            value={partyCode}
            onChange={(e) => setPartyCode(e.target.value)}
            className="border px-2 py-1 w-full"
            placeholder="e.g. 1165"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Party Name</label>
          <input
            type="text"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            className="border px-2 py-1 w-full"
            placeholder="e.g. Akash Traders"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block mb-1 font-medium">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
        </div>
      </div>

      <button
        onClick={fetchData}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Go
      </button>

      {loading ? (
        <p className="mt-4">Loading data...</p>
      ) : (
        data.length > 0 && (
          <table className="mt-6 w-full table-auto border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">VNo</th>
                <th className="border px-2 py-1">PartyCode</th>
                <th className="border px-2 py-1">Party</th>
                <th className="border px-2 py-1">MyType</th>
                <th className="border px-2 py-1">VAmt</th>
                <th className="border px-2 py-1">AdjAmt</th>
                <th className="border px-2 py-1">OS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{new Date(r.UsrDate).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{r.VNo}</td>
                  <td className="border px-2 py-1">{r.PartyCode}</td>
                  <td className="border px-2 py-1">{r.Party}</td>
                  <td className="border px-2 py-1">{r.MyType}</td>
                  <td className="border px-2 py-1 text-right">{r.VAmt.toFixed(2)}</td>
                  <td className="border px-2 py-1 text-right">{r.AdjAmt.toFixed(2)}</td>
                  <td className="border px-2 py-1 text-right">{r.OS.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
