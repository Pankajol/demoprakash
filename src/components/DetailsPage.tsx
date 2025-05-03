// app/details/page.tsx

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

export default function DetailsPage() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || '';
    const year = searchParams.get('year') || '';
    const month = searchParams.get('month') || '';

    const [records, setRecords] = useState<RecordItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // filters
    const [searchParty, setSearchParty] = useState('');
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
    useEffect(() => {
        console.log('Fetched records:', records);
    }, [records]);

    // filtered by party and date
    const filtered = useMemo(() => records.filter(r => {
        const matchParty = searchParty ? r.type.toLowerCase().includes(searchParty.toLowerCase()) : true;
        const date = new Date(r.UsrDate);
        const fromOk = dateFrom ? date >= dateFrom : true;
        const toOk = dateTo ? date <= dateTo : true;
        return matchParty && fromOk && toOk;
    }), [records, searchParty, dateFrom, dateTo]);

    // exports
    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filtered);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Details');
        XLSX.writeFile(wb, `Details_${type}_${year}_${month}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const cols = ['VNo', 'Type', 'Year', 'PartyCode', 'PartyName', 'VAmt', 'AdjAmt', 'Month', 'Amt', 'Date'];
        const rows = filtered.map(r => [r.VNo, r.MyType, r.YearId, r.PartyCode, r.type, r.VAmt, r.AdjAmt, r.IMonth, r.Amt, new Date(r.UsrDate).toLocaleDateString()]);
        autoTable(doc, { head: [cols], body: rows });
        doc.save(`Details_${type}_${year}_${month}.pdf`);
    };

    if (loading) return <p className="p-4">Loading...</p>;
    if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-xl font-bold">Details for {type} – {year}/{month}</h1>

            {/* filters */}
            <div className="flex flex-wrap gap-4">
                <input
                    className="border rounded px-3 py-2 flex-1"
                    placeholder="Search Party"
                    value={searchParty}
                    onChange={e => setSearchParty(e.target.value)}
                />
                <DatePicker selected={dateFrom} onChange={setDateFrom} placeholderText="From Date" className="border rounded px-3 py-2"  dateFormat="dd-MM-yyyy"/>
                <DatePicker selected={dateTo} onChange={setDateTo} placeholderText="To Date" className="border rounded px-3 py-2" dateFormat="dd-MM-yyyy" />
                <button onClick={() => { setSearchParty(''); setDateFrom(null); setDateTo(null); }} className="bg-gray-200 px-4 py-2 rounded">Clear</button>
            </div>

            {/* exports */}
            {/* <div className="flex gap-2">
                <button onClick={exportExcel} className="bg-green-500 text-white px-4 py-2 rounded">Export Excel</button>
                <button onClick={exportPDF} className="bg-blue-500 text-white px-4 py-2 rounded">Export PDF</button>
            </div> */}

            {/* table */}
            {filtered.length === 0 ? (
                <p>No records found.</p>
            ) : (
                <div className="overflow-auto shadow rounded bg-white">
                    <table className="min-w-full table-auto">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2">VNo</th>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Year</th>
                                <th className="px-3 py-2">Party Code</th>
                                <th className="px-3 py-2">Party Name</th>
                                <th className="px-3 py-2 text-right">VAmt</th>
                                <th className="px-3 py-2 text-right">AdjAmt</th>
                                <th className="px-3 py-2 text-center">Month</th>
                                <th className="px-3 py-2 text-right">Amt</th>
                                <th className="px-3 py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r, i) => (
                                <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                                    <td className="px-3 py-2">{r.VNo}</td>
                                    <td className="px-3 py-2">{r.MyType}</td>
                                    <td className="px-3 py-2">{r.YearId}</td>
                                    <td className="px-3 py-2">{r.PartyCode}</td>
                                    <td className="px-3 py-2">{r.type}</td>
                                    <td className="px-3 py-2 text-right">{r.VAmt}</td>
                                    <td className="px-3 py-2 text-right">{r.AdjAmt}</td>
                                    <td className="px-3 py-2 text-center">{r.IMonth}</td>
                                    <td className="px-3 py-2 text-right">{r.Amt}</td>
                                    <td className="px-3 py-2">{new Date(r.UsrDate).toLocaleDateString('en-GB')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
