// 'use client';

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Select from 'react-select';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { saveAs } from 'file-saver';
// import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';

// type Option = { value: string; label: string };
// interface Transaction {
//   MyType: string;
//   VNo: string;
//   UsrDate: string;
//   PartyCode: string;
//   Party: string;
//   VAmt: number;
//   AdjAmt: number;
//   OS: number;
// }

// export default function PartyOutstandingPage() {
//   // Company info for letterhead
//   const [companyName, setCompanyName] = useState<string>('');

//   // Filters & data
//   const [parties, setParties] = useState<Option[]>([]);
//   const [selectedParty, setSelectedParty] = useState<Option | null>(null);
//   const [types, setTypes] = useState<Option[]>([]);
//   const [selectedType, setSelectedType] = useState<string>('');
//   const [fromDate, setFromDate] = useState<Date | null>(null);
//   const [toDate, setToDate] = useState<Date | null>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [hasFetched, setHasFetched] = useState<boolean>(false);

//   const cols = ['MyType', 'VNo', 'UsrDate', 'PartyCode', 'Party', 'VAmt', 'AdjAmt', 'OS'];
//   const partyCode = selectedParty?.value || '';
//   const partyLabel = selectedParty?.label.split(' - ')[0] || '';

//   // Load companyName from localStorage
//   useEffect(() => {
//     const raw = localStorage.getItem('user');
//     if (raw) {
//       try {
//         const user = JSON.parse(raw);
//         if (user.companyName) setCompanyName(user.companyName);
//       } catch {}
//     }
//   }, []);

//   // Load parties
//   useEffect(() => {
//     axios.get<Option[]>('/api/outstanding/party')
//       .then(r => setParties(r.data))
//       .catch(console.error);
//   }, []);

//   // Load types when party changes
//   useEffect(() => {
//     if (!selectedParty) {
//       setTypes([]);
//       setSelectedType('');
//       return;
//     }
//     axios.get<string[]>('/api/outstanding/mytypes', {
//       params: { partyCode }
//     })
//       .then(r => setTypes(r.data.map(t => ({ value: t, label: t }))))
//       .catch(console.error);
//   }, [selectedParty]);

//   // Handle generation
//   // const handleGenerate = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setHasFetched(true);
//   //   if (!selectedParty || !selectedType || !fromDate || !toDate) {
//   //     alert('Please select Party, Type, From Date and To Date.');
//   //     return;
//   //   }
//   //   setLoading(true);
//   //   try {
//   //     const { data } = await axios.get<Transaction[]>('/api/outstanding/transactions', {
//   //       params: {
//   //         partyCode,
//   //         party: partyLabel,
//   //         myTypes: selectedType,
//   //         fromDate: fromDate.toISOString().slice(0,10),
//   //         toDate:   toDate.toISOString().slice(0,10),
//   //       }
//   //     });
//   //     setTransactions(data);
//   //   } catch (err) {
//   //     console.error('Error fetching transactions:', err);
//   //     alert('Error loading data');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//   const handleGenerate = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setHasFetched(true);

//   if (!fromDate || !toDate) {
//     alert('Please select From Date and To Date.');
//     return;
//   }

//   setLoading(true);
//   try {
//     const params: any = {
//     fromDate: fromDate.toLocaleDateString('en-CA'), // 'YYYY-MM-DD'
//   toDate: toDate.toLocaleDateString('en-CA'),
//     };

//     if (partyCode) params.partyCode = partyCode;
//     if (partyLabel) params.party = partyLabel;
//     if (selectedType) params.myTypes = selectedType;

//     const { data } = await axios.get<Transaction[]>('/api/outstanding/transactions', { params });
//     setTransactions(data);
//   } catch (err) {
//     console.error('Error fetching transactions:', err);
//     alert('Error loading data');
//   } finally {
//     setLoading(false);
//   }
// };


//   // Compute totals
//   const totalVAmt   = transactions.reduce((sum, t) => sum + t.VAmt, 0);
//   const totalAdjAmt = transactions.reduce((sum, t) => sum + t.AdjAmt, 0);
//   const totalOS     = transactions.reduce((sum, t) => sum + t.OS, 0);

//   const formatDate = (d: Date) => d.toLocaleDateString('en-GB');

//   // Export to Excel
//   const exportToExcel = () => {
//     if (!transactions.length) return;

//     const headerRows: any[] = [
//       [companyName],
//       [],
//       ['Party Code', partyCode],
//       ['Party',      partyLabel],
//       ['Type',       selectedType],
//       ['From',       fromDate!.toLocaleDateString().slice(0,10)],
//       ['To',         toDate!.toLocaleDateString().slice(0,10)],
//       []
//     ];
//     const dataRows = transactions.map(t => [
//       t.MyType,
//       t.VNo,
//       formatDate(new Date(t.UsrDate)),
//       t.PartyCode,
//       t.Party,
//       t.VAmt,
//       t.AdjAmt,
//       t.OS
//     ]);
//     const totalsRow = ['', '', '', '', 'Totals', totalVAmt, totalAdjAmt, totalOS];

//     const ws = XLSX.utils.aoa_to_sheet([
//       ...headerRows,
//       cols,
//       ...dataRows,
//       [],
//       totalsRow
//     ]);
//     ws['!merges'] = [{ s: { r:0, c:0 }, e: { r:0, c: cols.length-1 } }];
//     ws['!cols'] = Array(cols.length).fill({ wch:20 });

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, 'Outstanding');
//     const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
//     saveAs(new Blob([buf]), 'outstanding-report.xlsx');
//   };

//   // Export to PDF
//   const exportToPDF = () => {
//     if (!transactions.length) return;

//     const doc = new jsPDF();
//     doc.setFontSize(18);
//     doc.text(companyName, 105, 14, { align:'center' });

//     doc.setFontSize(12);
//     doc.text(`Party Code: ${partyCode}`, 14, 30);
//     doc.text(`Party: ${partyLabel}`, 14, 36);
//     doc.text(`Type: ${selectedType}`, 14, 42);
//     doc.text(`From: ${fromDate!.toLocaleDateString().slice(0,10)}`, 14, 48);
//     doc.text(`To:   ${toDate!.toLocaleDateString().slice(0,10)}`, 14, 54);

//     autoTable(doc, {
//       startY: 60,
//       head: [[
//         'MyType','VNo','Date','PartyCode','Party','VAmt','AdjAmt','OS'
//       ]],
//       body: transactions.map(t => [
//         t.MyType,
//         t.VNo,
//         formatDate(new Date(t.UsrDate)),
//         t.PartyCode,
//         t.Party,
//         t.VAmt,
//         t.AdjAmt,
//         t.OS
//       ]),
//       foot: [[
//         '', '', '', '', 'Totals',
//         totalVAmt,
//         totalAdjAmt,
//         totalOS
//       ]]
//     });

//     doc.save('outstanding-report.pdf');
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       {loading && (
//         <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
//           <div className="text-xl font-semibold">Loading...</div>
//         </div>
//       )}

//       <h1 className="text-2xl font-bold mb-4">OUTSTANDING REPORT</h1>
//       <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
//         <div>
//           <label className="block mb-2 font-medium">Party:</label>
//           <Select
//             options={parties}
//             value={selectedParty}
//             onChange={o => setSelectedParty(o)}
//             placeholder="Select Party"
//             isSearchable
//           />
//         </div>
//         <div>
//           <label className="block mb-2 font-medium">Type:</label>
//           <select
//             value={selectedType}
//             onChange={e => setSelectedType(e.target.value)}
//             className="w-full p-2 border rounded"
//           >
//             <option value="" disabled>Select Type</option>
//             {types.map(t =>
//               <option key={t.value} value={t.value}>{t.label}</option>
//             )}
//           </select>
//         </div>
//         <div>
//           <label className="block mb-2 font-medium">From Date:</label>
//           <DatePicker
//             selected={fromDate}
//             onChange={setFromDate}
//             dateFormat="dd/MM/yyyy"
//             className="w-full p-2 border rounded"
//             placeholderText="Select From"
//           />
//         </div>
//         <div>
//           <label className="block mb-2 font-medium">To Date:</label>
//           <DatePicker
//             selected={toDate}
//             onChange={setToDate}
//             dateFormat="dd/MM/yyyy"
//             className="w-full p-2 border rounded"
//             placeholderText="Select To"
//           />
//         </div>
//         <div className="mb-2 pt-8">
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//           >
//             {loading ? 'Generating...' : 'Generate'}
//           </button>
//         </div>
//       </form>

//       {hasFetched && !loading && !transactions.length && (
//         <div className="text-center text-gray-500">No data for selected filters.</div>
//       )}

//       {transactions.length > 0 && (
//         <>
//           <div className="flex space-x-4 mb-4">
//             <button
//               onClick={exportToPDF}
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//             >
//               Export PDF
//             </button>
//             <button
//               onClick={exportToExcel}
//               className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//             >
//               Export Excel
//             </button>
//           </div>
//           <table className="min-w-full border-collapse">
//             <thead>
//               <tr>{cols.map(h =>
//                 <th key={h} className="border px-2 py-1">{h}</th>
//               )}</tr>
//             </thead>
//             <tbody>
//               {transactions.map((t, i) =>
//                 <tr key={i} className="hover:bg-gray-50">
//                   {[t.MyType, t.VNo, formatDate(new Date(t.UsrDate)), t.PartyCode, t.Party, t.VAmt, t.AdjAmt, t.OS]
//                     .map((val, idx) =>
//                       <td key={idx} className="border px-2 py-1">{val}</td>
//                     )
//                   }
//                 </tr>
//               )}
//             </tbody>
//             <tfoot>
//               <tr className="font-bold bg-gray-100">
//                 <td colSpan={5} className="text-right border px-2 py-1">Totals:</td>
//                 <td className="border px-2 py-1">{totalVAmt}</td>
//                 <td className="border px-2 py-1">{totalAdjAmt}</td>
//                 <td className="border px-2 py-1">{totalOS}</td>
//               </tr>
//             </tfoot>
//           </table>
//         </>
//       )}
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select, { StylesConfig } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Option = { value: string; label: string };
interface Transaction {
  MyType: string;
  VNo: string;
  UsrDate: string;
  PartyCode: string;
  Party: string;
  VAmt: number;
  AdjAmt: number;
  OS: number;
}

export default function PartyOutstandingPage() {
  // Company info
  const [companyName, setCompanyName] = useState<string>('');
  // Filters & data
  const [parties, setParties] = useState<Option[]>([]);
  const [selectedParty, setSelectedParty] = useState<Option | null>(null);
  const [types, setTypes] = useState<Option[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  // Detect theme
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    mq.addEventListener('change', e => setIsDark(e.matches));
    return () => mq.removeEventListener('change', () => {});
  }, []);

  const cols = ['MyType','VNo','UsrDate','PartyCode','Party','VAmt','AdjAmt','OS'];
  const partyCode = selectedParty?.value || '';
  const partyLabel = selectedParty?.label.split(' - ')[0] || '';

  // Load companyName
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user.companyName) setCompanyName(user.companyName);
      } catch {}
    }
  }, []);

  // Load parties
  useEffect(() => {
    axios.get<Option[]>('/api/outstanding/party')
      .then(r => setParties(r.data))
      .catch(console.error);
  }, []);

  // Load types when party changes
  useEffect(() => {
    if (!selectedParty) {
      setTypes([]);
      setSelectedType('');
      return;
    }
    axios.get<string[]>('/api/outstanding/mytypes', { params: { partyCode } })
      .then(r => setTypes(r.data.map(t => ({ value: t, label: t }))))
      .catch(console.error);
  }, [selectedParty]);

  // Generate
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasFetched(true);
    if (!fromDate || !toDate) {
      alert('Please select From and To dates.');
      return;
    }
    setLoading(true);
    try {
      const params: any = {
        fromDate: fromDate.toISOString().slice(0,10),
        toDate: toDate.toISOString().slice(0,10)
      };
      if (partyCode) params.partyCode = partyCode;
      if (partyLabel) params.party = partyLabel;
      if (selectedType) params.myTypes = selectedType;

      const { data } = await axios.get<Transaction[]>('/api/outstanding/transactions', { params });
      setTransactions(data);
    } catch (err) {
      console.error(err);
      alert('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Totals
  const totalVAmt = transactions.reduce((s,t) => s+t.VAmt,0);
  const totalAdj = transactions.reduce((s,t) => s+t.AdjAmt,0);
  const totalOS = transactions.reduce((s,t) => s+t.OS,0);

  const formatDate = (d: Date) => d.toLocaleDateString('en-GB');

  // Exports
  const exportToExcel = () => {
    if (!transactions.length) return;
    const header = [ [companyName], [], ['Party', partyLabel], ['Type', selectedType], ['From', fromDate!.toLocaleDateString('en-GB').slice(0,10)], ['To', toDate!.toLocaleDateString('en-GB').slice(0,10)], [] ];
    const rows = transactions.map(t=>[t.MyType,t.VNo,formatDate(new Date(t.UsrDate)),t.PartyCode,t.Party,t.VAmt,t.AdjAmt,t.OS]);
    const sheet = XLSX.utils.aoa_to_sheet([ ...header, cols, ...rows, [], ['','','','','Totals', totalVAmt, totalAdj, totalOS] ]);
    sheet['!merges']=[{s:{r:0,c:0},e:{r:0,c:cols.length-1}}];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,sheet,'Outstanding');
    saveAs(new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})]), 'report.xlsx');
  };

  const exportToPDF = () => {
    if (!transactions.length) return;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(companyName,105,14,{align:'center'});
    doc.setFontSize(12);
    doc.text(`Party: ${partyLabel}`,14,30);
    doc.text(`Type: ${selectedType}`,14,36);
    doc.text(`From: ${fromDate!.toLocaleDateString('en-GB')}`,14,42);
    doc.text(`To: ${toDate!.toLocaleDateString('en-GB')}`,14,48);
    autoTable(doc, { startY:60, head:[cols], body:transactions.map(t=>[t.MyType,t.VNo,formatDate(new Date(t.UsrDate)),t.PartyCode,t.Party,t.VAmt,t.AdjAmt,t.OS]), foot:[[ '', '', '', '', 'Totals', totalVAmt, totalAdj, totalOS ]] });
    doc.save('report.pdf');
  };

  // Select styles
  const selectStyles: StylesConfig<Option,false> = useMemo(()=>({
    control:(base,{isFocused})=>({
      ...base,
      background: isDark?'#1f2937':'white',
      borderColor: isFocused? '#3b82f6': (isDark?'#374151':'#d1d5db'),
      boxShadow:'none',
      '&:hover':{borderColor:isDark?'#4b5563':'#9ca3af'}
    }),
    singleValue: base=>({...base,color:isDark?'white':'black'}),
    menu: base=>({...base,background:isDark?'#1f2937':'white'}),
    option:(base,{isFocused})=>({
      ...base,
      background:isFocused?(isDark?'#374151':'#e5e7eb'):(isDark?'#1f2937':'white'),
      color:isDark?'white':'black'
    }),
  }),[isDark]);

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
      {loading && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">Outstanding Report</h1>
      <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div>
          <label className="block mb-2">Party</label>
          <Select
            options={parties}
            value={selectedParty}
            onChange={o=>setSelectedParty(o)}
            styles={selectStyles}
            placeholder="Select party"
          />
        </div>
        <div>
          <label className="block mb-2">Type</label>
          <Select
            options={types}
            value={types.find(t=>t.value===selectedType)||null}
            onChange={o=>setSelectedType(o?.value||'')}
            styles={selectStyles}
            placeholder="Select type"
            isDisabled={!types.length}
          />
        </div>
        <div>
          <label className="block mb-2">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            dateFormat="dd/MM/yyyy"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:text-white"
            placeholderText="Select from"
          />
        </div>
        <div>
          <label className="block mb-2">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            dateFormat="dd/MM/yyyy"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 dark:text-white"
            placeholderText="Select to"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading? 'Generating...':'Generate'}
          </button>
        </div>
      </form>

      {hasFetched && !loading && !transactions.length && (
        <p className="text-center text-gray-500 dark:text-gray-400">No data for selected filters.</p>
      )}

      {transactions.length>0 && (
        <>
          <div className="flex space-x-4 mb-4">
            <button onClick={exportToPDF} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Export Excel</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>{cols.map(h=>(<th key={h} className="px-3 py-2 text-left font-medium">{h}</th>))}</tr>
              </thead>
              <tbody>
                {transactions.map((t,i)=>(
                  <tr key={i} className={i%2===0? 'bg-white dark:bg-gray-900':'bg-gray-50 dark:bg-gray-800'}>
                    {[t.MyType,t.VNo,formatDate(new Date(t.UsrDate)),t.PartyCode,t.Party,t.VAmt,t.AdjAmt,t.OS]
                      .map((v,j)=><td key={j} className="px-3 py-2 text-sm">{v}</td>)}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 dark:bg-gray-700 font-semibold">
                  <td colSpan={5} className="text-right px-3 py-2">Totals:</td>
                  <td className="px-3 py-2">{totalVAmt}</td>
                  <td className="px-3 py-2">{totalAdj}</td>
                  <td className="px-3 py-2">{totalOS}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
