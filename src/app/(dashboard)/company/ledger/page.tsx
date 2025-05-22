
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Option = { label: string; value: string };

type ReportItem = {
  Mytype: string;
  VNo: string;
  UsrDate: string;
  PartyCode: string;
  PartyName?: string;
  Type: string;
  Ledger: string;
  DrAmt: number;
  CrAmt: number;
  Bal: number;
  YearId: string;
};

const ReportForm = () => {

    // Columns for tables/exports
    const cols = [
      'MyType',
      'VNo',
      'UsrDate',
      'PartyCode',
      'Part Name',
      'Ledger',
      'DrAmt',
      'CrAmt',
      'Balance',
      'YearId',
    ];
    // const partyName = partyOptions.find(o => o.value === partyCode)?.label || '';
  
      // const [companyName, setCompanyName] = useState<string>('');  // ← state for dynamic company name
    
      // On mount, read user object (with companyName) from localStorage
      // const [companyName, setCompanyName] = useState('');
  const [partyOptions, setPartyOptions] = useState<Option[]>([]);
  // Now two pieces of state:
  const [partyCode, setPartyCode] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');

  // Load companyName from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user.companyName) setCompanyName(user.companyName);
    }
  }, []);

  // Fetch party list
  useEffect(() => {
    axios
      .get<Option[]>('/api/party')
      .then(({ data }) => {
        // Assuming API returns [{ label, value: "1122 + ARIHANT AGENCY" }, …]
        setPartyOptions(data);
      })
      .catch((err) => console.error('Error fetching party codes:', err));
  }, []);

  // Fetch fiscal years
  useEffect(() => {
    fetch('/api/yearIds')
      .then((res) => res.json())
      .then((data: { YearId: number }[]) => {
        const list = data.map((d) => d.YearId);
        setYears(list);
        if (list.length) setSelectedYear(list[0]);
      })
      .catch((err) => console.error('Error fetching years:', err));
  }, []);

  const handlePartySelect = (opt: Option | null) => {
    if (!opt) {
      setPartyCode('');
      setPartyName('');
      return;
    }
    // Split on the " + " we used as a delimiter :contentReference[oaicite:0]{index=0}:
    const [code, ...rest] = opt.value.split(' + ');
    setPartyCode(code.trim());
    setPartyName(rest.join(' + ').trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasFetched(true);
    if (!partyCode || !partyName || !fromDate || !toDate || !selectedYear) {
      alert('Please select Party, Year, From Date and To Date.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get<ReportItem[]>('/api/ledgers', {
        params: {
          partyCode,
          party: partyName,          // send name separately :contentReference[oaicite:1]{index=1}
          yearId: selectedYear.toString(),
          fromDate: fromDate.toISOString().slice(0, 10),
          toDate: toDate.toISOString().slice(0, 10),
        },
      });
      // compute running balance
      let cumDr = 0,
      cumCr = 0;
      const proc = res.data.map((row) => {
        cumDr += row.DrAmt;
        cumCr += row.CrAmt;
        return { ...row, Bal: cumDr - cumCr };
      });
      setReportData(proc);
    } catch (err) {
      console.error('Error fetching report:', err);
      alert('Error generating report.');
    } finally {
      setLoading(false);
    }
  };

  // Totals
  const { totalDr, totalCr } = reportData.reduce(
    (acc, i) => {
      acc.totalDr += i.DrAmt;
      acc.totalCr += i.CrAmt;
      return acc;
    },
    { totalDr: 0, totalCr: 0 }
  );

  // Export to Excel
  const exportToExcel = () => {
    if (!reportData.length) return;

    // Build sheet data
    const headerRows: any[] = [
      [companyName],
      [],
      // ['Party Name', partyCode],
      ['Party Name', partyName],
      ['Year', selectedYear?.toString() || ''],
      ['From Date',new Date(fromDate?.toLocaleDateString().split('T')[0] || '') ],
      ['To Date', toDate?.toLocaleDateString().split('T')[0] || ''],
      [],
    ];
    const dataRows = reportData.map((item) => [
      item.Mytype,
      item.VNo,
      new Date(item.UsrDate).toLocaleDateString('en-GB'),
      item.PartyCode,
      item.Type,
      item.Ledger,
      item.DrAmt,
      item.CrAmt,
      item.Bal,
      item.YearId,
    ]);
    const totalsRow = ['', '', '', '', '', 'Totals', totalDr, totalCr, '', ''];

    const sheetData = [...headerRows, cols, ...dataRows, [], totalsRow];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Merge company name across all columns
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: cols.length - 1 } },
    ];
    // Full-width columns
    ws['!cols'] = Array(cols.length).fill({ wch: 20 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'ledger-report.xlsx');
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!reportData.length) return;

    const doc = new jsPDF();
    // if (companyLogo) {
    //   doc.addImage(companyLogo, 'PNG', 14, 8, 30, 15);
    // }
    doc.setFontSize(18);
    doc.text(`Company:${ companyName } `,50 ,14, { align: 'center' });
    doc.setFontSize(12);

    // Filters
    // doc.text(`Party Code: ${partyCode}`, 14, 30);
    doc.text(`Party Name: ${partyName}`, 14, 30);
    doc.text(`Year: ${selectedYear}`, 14, 36);
    doc.text(`From: ${fromDate?.toISOString().split('T')[0]}`, 14, 42);
    doc.text(`To: ${toDate?.toISOString().split('T')[0]}`, 14, 48);

    // Table with totals footer
    autoTable(doc, {
      startY: 60,
      tableWidth: 'auto',
      head: [cols],
      body: reportData.map((item) => [
        item.Mytype,
        item.VNo,
        new Date(item.UsrDate).toLocaleDateString('en-GB'),
        item.PartyCode,
        item.Type,
        item.Ledger,
        item.DrAmt,
        item.CrAmt,
        item.Bal,
        item.YearId,
      ]),
      foot: [['', '', '', '', '', 'Totals:', totalDr, totalCr, '', '']],
    });

    doc.save('ledger-report.pdf');
  };


  return (
    <div className="p-6 max-w-6xl mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">LEDGER REPORT</h1>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6"
      >
        {/* Party */}
        <div>
          <label className="block mb-2 font-medium">Party:</label>
          <Select
            options={partyOptions}
            value={
              partyCode
                ? { value: `${partyCode} + ${partyName}`, label: `${partyCode} + ${partyName}` }
                : null
            }
            onChange={handlePartySelect}
            placeholder="Select Party"
            isClearable
          />
        </div>
        {/* Year */}
        <div>
          <label className="block mb-2 font-medium">Year:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedYear ?? ''}
            onChange={(e) => setSelectedYear(Number(e.target.value) || undefined)}
          >
            <option value="" disabled>
              Select Year
            </option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {/* From */}
        <div>
          <label className="block mb-2 font-medium">From Date:</label>
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            dateFormat="dd/MM/yyyy"
            className="w-full p-2 border rounded"
            placeholderText="Select From"
          />
        </div>
        {/* To */}
        <div>
          <label className="block mb-2 font-medium">To Date:</label>
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            dateFormat="dd/MM/yyyy"
            className="w-full p-2 border rounded"
            placeholderText="Select To"
          />
        </div>
        {/* Submit */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>

      {hasFetched && !loading && reportData.length === 0 && (
        <div className="text-center text-gray-500">
          No data available for the selected filters.
        </div>
      )}

      {reportData.length > 0 && (
         <>
         <div className="flex space-x-4 mb-4">
           <button
             onClick={exportToPDF}
             disabled={loading}
             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
           >
             Export PDF
           </button>
           <button
             onClick={exportToExcel}
             disabled={loading}
             className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
           >
             Export Excel
           </button>
         </div>

         <table className="min-w-full border-collapse">
         <thead>
            <tr>{['MyType','VNo','UsrDate','Ledger','DrAmt','CrAmt','Balance','YearId','PartyCode','Part Name'].map(h => (<th key={h} className="border px-2 py-1">{h}</th>))}</tr>
           </thead>
           <tbody>
             {reportData.map((it, i) => (
               <tr key={i}>
                 {[
                   it.Mytype,
                   it.VNo,
                   new Date(it.UsrDate).toLocaleDateString('en-GB'),
                   it.Ledger,
                   it.DrAmt,
                   it.CrAmt,
                   it.Bal,
                   it.YearId,
                   it.PartyCode,
                   it.Type,
                 ].map((val, idx) => (
                   <td key={idx} className="border px-2 py-1">
                     {val}
                   </td>
                 ))}
               </tr>
             ))}
           </tbody>
           <tfoot>
             <tr>
               <td
                 colSpan={4}
                 className="text-right font-bold px-2 py-1 border"
               >
                 Totals:
               </td>
               <td className="border px-2 py-1 font-bold">{totalDr}</td>
               <td className="border px-2 py-1 font-bold">{totalCr}</td>
               <td colSpan={4}></td>
             </tr>
           </tfoot>
         </table>
       </>
      )}
    </div>
  );
};

export default ReportForm;



// 'use client';

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import Select from 'react-select';
// import { saveAs } from 'file-saver';
// import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';

// type Option = { label: string; value: string };

// type ReportItem = {
//   Mytype: string;
//   VNo: string;
//   UsrDate: string;
//   PartyCode: string;
//   PartyName?: string;
//   Type: string;
//   Ledger: string;
//   DrAmt: number;
//   CrAmt: number;
//   Bal: number;
//   YearId: string;
// };

// const ReportForm = () => {
//   // Company info from logged-in user
//   // const [companyName, setCompanyName] = useState<string>('');
//   // const [companyLogo, setCompanyLogo] = useState<string>('');

//   // Report filters & data
//   const [partyCode, setPartyCode] = useState<string>('');
//   const [partyOptions, setPartyOptions] = useState<Option[]>([]);
//   const [selectedYear, setSelectedYear] = useState<number>();
//   const [fromDate, setFromDate] = useState<Date | null>(null);
//   const [toDate, setToDate] = useState<Date | null>(null);
//   const [reportData, setReportData] = useState<ReportItem[]>([]);
//   const [years, setYears] = useState<number[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [hasFetched, setHasFetched] = useState<boolean>(false);

  // // Columns for tables/exports
  // const cols = [
  //   'MyType',
  //   'VNo',
  //   'UsrDate',
  //   'PartyCode',
  //   'Part Name',
  //   'Ledger',
  //   'DrAmt',
  //   'CrAmt',
  //   'Balance',
  //   'YearId',
  // ];
  // const partyName = partyOptions.find(o => o.value === partyCode)?.label || '';

  //   const [companyName, setCompanyName] = useState<string>('');  // ← state for dynamic company name
  
  //   // On mount, read user object (with companyName) from localStorage
  //   // const [companyName, setCompanyName] = useState('');
  
//     useEffect(() => {
//       // this only runs client‐side
//       const raw = localStorage.getItem('user');
//       console.log('layout useEffect running…', localStorage.getItem('user'))
//       if (raw) {
//         const user = JSON.parse(raw);
//         if (user.companyName) setCompanyName(user.companyName);
//       }
//     }, []);

//   // Load company info from localStorage
//   // useEffect(() => {
//   //   try {
//   //     const user = JSON.parse(localStorage.getItem('company') || '{}');
//   //     if (user.companyName) setCompanyName(user.companyName);
//   //     if (user.companyLogo) {
//   //       // fetch logo as base64
//   //       axios
//   //         .get(user.companyLogo, { responseType: 'arraybuffer' })
//   //         .then((res) => {
//   //           const base64 = btoa(
//   //             new Uint8Array(res.data).reduce(
//   //               (acc, byte) => acc + String.fromCharCode(byte),
//   //               ''
//   //             )
//   //           );
//   //           setCompanyLogo(`data:image/png;base64,${base64}`);
//   //         });
//   //     }
//   //   } catch {}
//   // }, []);

//   // Fetch party codes
//   useEffect(() => {
//     axios
//       .get('/api/party')
//       .then(({ data }) => setPartyOptions(data))
//       .catch((err) => console.error('Error fetching party codes:', err));
//   }, []);

//   // Fetch years
//   useEffect(() => {
//     fetch('/api/yearIds')
//       .then((res) => res.json())
//       .then((data) => {
//         const yearList = data.map((item: { YearId: number }) => item.YearId);
//         setYears(yearList);
//         if (yearList.length) setSelectedYear(yearList[0]);
//       })
//       .catch((err) => console.error('Error fetching years:', err));
//   }, []);

//   // Handle report generation
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setHasFetched(true);

//     if (!partyCode || !fromDate || !toDate || !selectedYear ) {
//       alert('Please select Party Code, Year, From Date and To Date.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data } = await axios.get('/api/ledgers', {
//         params: {
//           partyCode,
//           // partyName,
//           fromDate: fromDate.toISOString().split('T')[0],
//           toDate: toDate.toISOString().split('T')[0],
//           yearId: selectedYear.toString(),
//         },
//       });

//       let cumDr = 0;
//       let cumCr = 0;
//       const processed: ReportItem[] = data.map((item: ReportItem) => {
//         cumDr += item.DrAmt;
//         cumCr += item.CrAmt;
//         return { ...item, Bal: cumDr - cumCr };
//       });
//       setReportData(processed);
//     } catch (err) {
//       console.error('Error fetching report:', err);
//       alert('Error generating report.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Compute totals once
//   const { totalDr, totalCr } = reportData.reduce(
//     (acc, i) => {
//       acc.totalDr += i.DrAmt;
//       acc.totalCr += i.CrAmt;
//       return acc;
//     },
//     { totalDr: 0, totalCr: 0 }
//   );

  // // Export to Excel
  // const exportToExcel = () => {
  //   if (!reportData.length) return;

  //   // Build sheet data
  //   const headerRows: any[] = [
  //     [companyName],
  //     [],
  //     // ['Party Name', partyCode],
  //     ['Party Name', partyName],
  //     ['Year', selectedYear?.toString() || ''],
  //     ['From Date',new Date(fromDate?.toLocaleDateString().split('T')[0] || '') ],
  //     ['To Date', toDate?.toLocaleDateString().split('T')[0] || ''],
  //     [],
  //   ];
  //   const dataRows = reportData.map((item) => [
  //     item.Mytype,
  //     item.VNo,
  //     new Date(item.UsrDate).toLocaleDateString('en-GB'),
  //     item.PartyCode,
  //     item.Type,
  //     item.Ledger,
  //     item.DrAmt,
  //     item.CrAmt,
  //     item.Bal,
  //     item.YearId,
  //   ]);
  //   const totalsRow = ['', '', '', '', '', 'Totals', totalDr, totalCr, '', ''];

  //   const sheetData = [...headerRows, cols, ...dataRows, [], totalsRow];
  //   const ws = XLSX.utils.aoa_to_sheet(sheetData);

  //   // Merge company name across all columns
  //   ws['!merges'] = [
  //     { s: { r: 0, c: 0 }, e: { r: 0, c: cols.length - 1 } },
  //   ];
  //   // Full-width columns
  //   ws['!cols'] = Array(cols.length).fill({ wch: 20 });

  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
  //   const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //   saveAs(new Blob([buffer]), 'ledger-report.xlsx');
  // };

  // // Export to PDF
  // const exportToPDF = () => {
  //   if (!reportData.length) return;

  //   const doc = new jsPDF();
  //   // if (companyLogo) {
  //   //   doc.addImage(companyLogo, 'PNG', 14, 8, 30, 15);
  //   // }
  //   doc.setFontSize(18);
  //   doc.text(`Company:${ companyName } `,50 ,14, { align: 'center' });
  //   doc.setFontSize(12);

  //   // Filters
  //   // doc.text(`Party Code: ${partyCode}`, 14, 30);
  //   doc.text(`Party Name: ${partyName}`, 14, 30);
  //   doc.text(`Year: ${selectedYear}`, 14, 36);
  //   doc.text(`From: ${fromDate?.toISOString().split('T')[0]}`, 14, 42);
  //   doc.text(`To: ${toDate?.toISOString().split('T')[0]}`, 14, 48);

  //   // Table with totals footer
  //   autoTable(doc, {
  //     startY: 60,
  //     tableWidth: 'auto',
  //     head: [cols],
  //     body: reportData.map((item) => [
  //       item.Mytype,
  //       item.VNo,
  //       new Date(item.UsrDate).toLocaleDateString('en-GB'),
  //       item.PartyCode,
  //       item.Type,
  //       item.Ledger,
  //       item.DrAmt,
  //       item.CrAmt,
  //       item.Bal,
  //       item.YearId,
  //     ]),
  //     foot: [['', '', '', '', '', 'Totals:', totalDr, totalCr, '', '']],
  //   });

  //   doc.save('ledger-report.pdf');
  // };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       {loading && (
//         <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
//           <div className="text-xl font-semibold">Loading...</div>
//         </div>
//       )}

//       <h1 className="text-2xl font-bold mb-4">LEDGER REPORT</h1>

//       <form
//         onSubmit={handleSubmit}
//         className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6"
//       >
//         {/* Party Code */}
//         <div>
//           <label htmlFor="partyCode" className="block mb-2 font-medium">
//             Party Code:
//           </label>
//           <Select
//             id="partyCode"
//             options={partyOptions}
//             value={partyOptions.find((o) => o.value === partyCode)}
//             onChange={(o) => setPartyCode(o?.value || '')}
//             placeholder="Select Party Code"
//             isSearchable
//           />
//         </div>
  

//         {/* Year */}
//         <div>
//           <label className="block mb-2 font-medium">Year:</label>
//           <select
//             value={selectedYear ?? ''}
//             onChange={(e) =>
//               setSelectedYear(parseInt(e.target.value) || undefined)
//             }
//             className="w-full p-2 border rounded"
//           >
//             <option value="" disabled>
//               Select Year
//             </option>
//             {years.map((y) => (
//               <option key={y} value={y}>
//                 {y}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* From Date */}
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

//         {/* To Date */}
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

//         {/* Submit */}
//         <div className="mb-2 pt-8">
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
//           >
//             {loading ? 'Generating...' : 'Generate Report'}
//           </button>
//         </div>
//       </form>

//       {/* No-data message */}
//       {hasFetched && !loading && reportData.length === 0 && (
//         <div className="text-center text-gray-500">
//           No data available for the selected filters.
//         </div>
//       )}

//       {/* Results table & exports */}
      // {reportData.length > 0 && (
        // <>
        //   <div className="flex space-x-4 mb-4">
        //     <button
        //       onClick={exportToPDF}
        //       disabled={loading}
        //       className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        //     >
        //       Export PDF
        //     </button>
        //     <button
        //       onClick={exportToExcel}
        //       disabled={loading}
        //       className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        //     >
        //       Export Excel
        //     </button>
        //   </div>

        //   <table className="min-w-full border-collapse">
        //   <thead>
        //      <tr>{['MyType','VNo','UsrDate','Ledger','DrAmt','CrAmt','Balance','YearId','PartyCode','Part Name'].map(h => (<th key={h} className="border px-2 py-1">{h}</th>))}</tr>
        //     </thead>
        //     <tbody>
        //       {reportData.map((it, i) => (
        //         <tr key={i}>
        //           {[
        //             it.Mytype,
        //             it.VNo,
        //             new Date(it.UsrDate).toLocaleDateString('en-GB'),
        //             it.Ledger,
        //             it.DrAmt,
        //             it.CrAmt,
        //             it.Bal,
        //             it.YearId,
        //             it.PartyCode,
        //             it.Type,
        //           ].map((val, idx) => (
        //             <td key={idx} className="border px-2 py-1">
        //               {val}
        //             </td>
        //           ))}
        //         </tr>
        //       ))}
        //     </tbody>
        //     <tfoot>
        //       <tr>
        //         <td
        //           colSpan={4}
        //           className="text-right font-bold px-2 py-1 border"
        //         >
        //           Totals:
        //         </td>
        //         <td className="border px-2 py-1 font-bold">{totalDr}</td>
        //         <td className="border px-2 py-1 font-bold">{totalCr}</td>
        //         <td colSpan={4}></td>
        //       </tr>
        //     </tfoot>
        //   </table>
        // </>
      // )}
//     </div>
//   );
// };

// export default ReportForm;
