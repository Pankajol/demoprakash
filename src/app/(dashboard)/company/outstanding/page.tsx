'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
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
  // Company info for letterhead
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

  const cols = ['MyType', 'VNo', 'UsrDate', 'PartyCode', 'Party', 'VAmt', 'AdjAmt', 'OS'];
  const partyCode = selectedParty?.value || '';
  const partyLabel = selectedParty?.label.split(' - ')[0] || '';

  // Load companyName from localStorage
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
    axios.get<string[]>('/api/outstanding/mytypes', {
      params: { partyCode }
    })
      .then(r => setTypes(r.data.map(t => ({ value: t, label: t }))))
      .catch(console.error);
  }, [selectedParty]);

  // Handle generation
  // const handleGenerate = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setHasFetched(true);
  //   if (!selectedParty || !selectedType || !fromDate || !toDate) {
  //     alert('Please select Party, Type, From Date and To Date.');
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const { data } = await axios.get<Transaction[]>('/api/outstanding/transactions', {
  //       params: {
  //         partyCode,
  //         party: partyLabel,
  //         myTypes: selectedType,
  //         fromDate: fromDate.toISOString().slice(0,10),
  //         toDate:   toDate.toISOString().slice(0,10),
  //       }
  //     });
  //     setTransactions(data);
  //   } catch (err) {
  //     console.error('Error fetching transactions:', err);
  //     alert('Error loading data');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleGenerate = async (e: React.FormEvent) => {
  e.preventDefault();
  setHasFetched(true);

  if (!fromDate || !toDate) {
    alert('Please select From Date and To Date.');
    return;
  }

  setLoading(true);
  try {
    const params: any = {
    fromDate: fromDate.toLocaleDateString('en-CA'), // 'YYYY-MM-DD'
  toDate: toDate.toLocaleDateString('en-CA'),
    };

    if (partyCode) params.partyCode = partyCode;
    if (partyLabel) params.party = partyLabel;
    if (selectedType) params.myTypes = selectedType;

    const { data } = await axios.get<Transaction[]>('/api/outstanding/transactions', { params });
    setTransactions(data);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    alert('Error loading data');
  } finally {
    setLoading(false);
  }
};


  // Compute totals
  const totalVAmt   = transactions.reduce((sum, t) => sum + t.VAmt, 0);
  const totalAdjAmt = transactions.reduce((sum, t) => sum + t.AdjAmt, 0);
  const totalOS     = transactions.reduce((sum, t) => sum + t.OS, 0);

  const formatDate = (d: Date) => d.toLocaleDateString('en-GB');

  // Export to Excel
  const exportToExcel = () => {
    if (!transactions.length) return;

    const headerRows: any[] = [
      [companyName],
      [],
      ['Party Code', partyCode],
      ['Party',      partyLabel],
      ['Type',       selectedType],
      ['From',       fromDate!.toLocaleDateString().slice(0,10)],
      ['To',         toDate!.toLocaleDateString().slice(0,10)],
      []
    ];
    const dataRows = transactions.map(t => [
      t.MyType,
      t.VNo,
      formatDate(new Date(t.UsrDate)),
      t.PartyCode,
      t.Party,
      t.VAmt,
      t.AdjAmt,
      t.OS
    ]);
    const totalsRow = ['', '', '', '', 'Totals', totalVAmt, totalAdjAmt, totalOS];

    const ws = XLSX.utils.aoa_to_sheet([
      ...headerRows,
      cols,
      ...dataRows,
      [],
      totalsRow
    ]);
    ws['!merges'] = [{ s: { r:0, c:0 }, e: { r:0, c: cols.length-1 } }];
    ws['!cols'] = Array(cols.length).fill({ wch:20 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Outstanding');
    const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([buf]), 'outstanding-report.xlsx');
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!transactions.length) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(companyName, 105, 14, { align:'center' });

    doc.setFontSize(12);
    doc.text(`Party Code: ${partyCode}`, 14, 30);
    doc.text(`Party: ${partyLabel}`, 14, 36);
    doc.text(`Type: ${selectedType}`, 14, 42);
    doc.text(`From: ${fromDate!.toLocaleDateString().slice(0,10)}`, 14, 48);
    doc.text(`To:   ${toDate!.toLocaleDateString().slice(0,10)}`, 14, 54);

    autoTable(doc, {
      startY: 60,
      head: [[
        'MyType','VNo','Date','PartyCode','Party','VAmt','AdjAmt','OS'
      ]],
      body: transactions.map(t => [
        t.MyType,
        t.VNo,
        formatDate(new Date(t.UsrDate)),
        t.PartyCode,
        t.Party,
        t.VAmt,
        t.AdjAmt,
        t.OS
      ]),
      foot: [[
        '', '', '', '', 'Totals',
        totalVAmt,
        totalAdjAmt,
        totalOS
      ]]
    });

    doc.save('outstanding-report.pdf');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {loading && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">OUTSTANDING REPORT</h1>
      <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
        <div>
          <label className="block mb-2 font-medium">Party:</label>
          <Select
            options={parties}
            value={selectedParty}
            onChange={o => setSelectedParty(o)}
            placeholder="Select Party"
            isSearchable
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Type:</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>Select Type</option>
            {types.map(t =>
              <option key={t.value} value={t.value}>{t.label}</option>
            )}
          </select>
        </div>
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
        <div className="mb-2 pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {hasFetched && !loading && !transactions.length && (
        <div className="text-center text-gray-500">No data for selected filters.</div>
      )}

      {transactions.length > 0 && (
        <>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Export Excel
            </button>
          </div>
          <table className="min-w-full border-collapse">
            <thead>
              <tr>{cols.map(h =>
                <th key={h} className="border px-2 py-1">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {transactions.map((t, i) =>
                <tr key={i} className="hover:bg-gray-50">
                  {[t.MyType, t.VNo, formatDate(new Date(t.UsrDate)), t.PartyCode, t.Party, t.VAmt, t.AdjAmt, t.OS]
                    .map((val, idx) =>
                      <td key={idx} className="border px-2 py-1">{val}</td>
                    )
                  }
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td colSpan={5} className="text-right border px-2 py-1">Totals:</td>
                <td className="border px-2 py-1">{totalVAmt}</td>
                <td className="border px-2 py-1">{totalAdjAmt}</td>
                <td className="border px-2 py-1">{totalOS}</td>
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  );
}




// "use client";

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import Select from 'react-select';
// import { saveAs } from 'file-saver';
// import * as XLSX from 'xlsx';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';

// // Option type for selects
// type Option = { label: string; value: string };
// // Transaction item type
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
//   const [partyCode, setPartyCode] = useState<string>('');
//   const [partyOptions, setPartyOptions] = useState<Option[]>([]);
//   const [myType, setMyType] = useState<string>('');
//   const [myTypeOptions, setMyTypeOptions] = useState<Option[]>([]);
//   const [fromDate, setFromDate] = useState<Date | null>(null);
//   const [toDate, setToDate] = useState<Date | null>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [hasFetched, setHasFetched] = useState<boolean>(false);

//   const cols = ['MyType', 'VNo', 'UsrDate', 'PartyCode', 'Party', 'VAmt', 'AdjAmt', 'OS'];
//   const partyLabel = partyOptions.find(o => o.value === partyCode)?.label || '';

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

//   useEffect(() => {
//   axios.get('/api/outstanding/party')
//     .then(({ data }) => {
//       const options = data.map((p: any) => ({ value: p.value, label: p.label }));
//       console.log('Fetched partyOptions:', options); // <-- check this
//       setPartyOptions(options);
//     })
//     .catch(err => console.error('Error fetching parties:', err));
// }, []);

// useEffect(() => {
//   console.log('Current partyCode:', partyCode);
// }, [partyCode]);

//   // Fetch parties
//   // useEffect(() => {
//   //   axios.get('/api/outstanding/party')
//   //     .then(({ data }) =>
//   //       setPartyOptions(data.map((p: any) => ({ value: p.value, label: p.label })))
//   //     )
//   //     .catch(err => console.error('Error fetching parties:', err));
//   // }, []);

//   // Fetch types when party selected
//   useEffect(() => {
//     if (!partyCode) {
//       setMyTypeOptions([]);
//       setMyType('');
//       return;
//     }
//     axios.get('/api/outstanding/mytypes', { params: { partyCode } })
//       .then(({ data }) =>
//         setMyTypeOptions(data.map((t: string) => ({ value: t, label: t })))
//       )
//       .catch(err => console.error('Error fetching types:', err));
//   }, [partyCode]);

//   // Handle generation
//   const handleGenerate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setHasFetched(true);
//     if (!partyCode || !myType || !fromDate || !toDate) {
//       alert('Please select Party, Type, From Date and To Date.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const { data } = await axios.get('/api/outstanding/transactions', {
//         params: {
//           partyCode,
//           myTypes: myType,
//           fromDate: fromDate.toISOString().split('T')[0],
//           toDate: toDate.toISOString().split('T')[0],
//         }
//       });
//       setTransactions(data);
//     } catch (err) {
//       console.error('Error fetching transactions:', err);
//       alert('Error loading data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Compute totals
//   const { totalVAmt, totalAdjAmt, totalOS } = transactions.reduce(
//     (acc, t) => {
//       acc.totalVAmt += t.VAmt;
//       acc.totalAdjAmt += t.AdjAmt;
//       acc.totalOS += t.OS;
//       return acc;
//     }, { totalVAmt: 0, totalAdjAmt: 0, totalOS: 0 }
//   );

//   // Export to Excel
//   const exportToExcel = () => {
//     if (!transactions.length) return;
//     const headerRows: any[] = [
//       [companyName],
//       [],
//       ['Party', partyLabel],
//       ['Type', myType],
//       ['From', fromDate?.toISOString().split('T')[0]],
//       ['To', toDate?.toISOString().split('T')[0]],
//       []
//     ];
//     const dataRows = transactions.map(t => [
//       t.MyType, t.VNo, new Date(t.UsrDate).toLocaleDateString('en-GB'),
//       t.PartyCode, t.Party, t.VAmt, t.AdjAmt, t.OS
//     ]);
//     const totalsRow = ['', '', '', '', 'Totals', totalVAmt, totalAdjAmt, totalOS];
//     const wsData = [...headerRows, cols, ...dataRows, [], totalsRow];
//     const ws = XLSX.utils.aoa_to_sheet(wsData);
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
//     doc.text(`Party: ${partyLabel}`, 14, 30);
//     doc.text(`Type: ${myType}`, 14, 36);
//     doc.text(`From: ${fromDate?.toLocaleDateString().split('T')[0]}`, 14, 42);
//     doc.text(`To: ${toDate?.toLocaleDateString().split('T')[0]}`, 14, 48);
//     autoTable(doc, {
//       startY: 60,
//       head: [cols],
//       body: transactions.map(t => [
//         t.MyType, t.VNo, new Date(t.UsrDate).toLocaleDateString('en-GB'),
//         t.PartyCode, t.Party, t.VAmt, t.AdjAmt, t.OS
//       ]),
//       foot: [['', '', '', '', 'Totals', totalVAmt, totalAdjAmt, totalOS]],
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
//           {/* <Select
//             options={partyOptions}
//             value={partyOptions.find(o=>o.value===partyCode)}
//             onChange={o=>setPartyCode(o?.value||'')}
//             placeholder="Select Party"
//             isSearchable
//           /> */}

//           <Select
//   options={partyOptions}
//   value={partyOptions.find(o => o.value === partyCode)}
//   onChange={o => setPartyCode(o?.value || '')}
//   placeholder="Select Party"
//   isSearchable
// />
//         </div>
//         <div>
//           <label className="block mb-2 font-medium">Type:</label>
//           <select
//             value={myType}
//             onChange={e=>setMyType(e.target.value)}
//             className="w-full p-2 border rounded"
//           >
//             <option value="" disabled>Select Type</option>
//             {myTypeOptions.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
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
//           <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
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
//             <button onClick={exportToPDF} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export PDF</button>
//             <button onClick={exportToExcel} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Export Excel</button>
//           </div>
//           <table className="min-w-full border-collapse">
//             <thead>
//               <tr>{cols.map(h=><th key={h} className="border px-2 py-1">{h}</th>)}</tr>
//             </thead>
//             <tbody>
//               {transactions.map((t,i)=>(
//                 <tr key={i} className="hover:bg-gray-50">
//                   {[t.MyType, t.VNo, new Date(t.UsrDate).toLocaleDateString('en-GB'), t.PartyCode, t.Party, t.VAmt, t.AdjAmt, t.OS].map((val,idx)=>(
//                     <td key={idx} className="border px-2 py-1">{val}</td>
//                   ))}
//                 </tr>
//               ))}
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









































































// "use client";

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import DatePicker from 'react-datepicker'; // Import DatePicker
// import "react-datepicker/dist/react-datepicker.css"; // Import styles

// export default function PartyOutstandingPage() {
//   const [partyList, setPartyList] = useState([]);
//   const [transactions, setTransactions] = useState([]);
//   const [fromDate, setFromDate] = useState(new Date('2023-04-01')); // Start as Date object
//   const [toDate, setToDate] = useState(new Date('2024-03-31')); // Start as Date object
//   const [selectedParty, setSelectedParty] = useState('');
//   const [partyOptions, setPartyOptions] = useState([]);
//   const [myTypes, setMyTypes] = useState([]);
//   const [selectedMyType, setSelectedMyType] = useState('Sale'); // Default value
//   const [loading, setLoading] = useState(false);

  // // Function to format date to 'DD-MMM-YYYY' format (e.g., '01-Apr-2023')
  // const formatDate = (date: Date): string => {
  //   const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: '2-digit' };
  //   const formattedDate = date.toLocaleDateString('en-GB', options);
  //   return formattedDate.replace(/ /g, '-'); // Replace spaces with hyphens
  // };

//   // Fetch Party Options on component mount
//   useEffect(() => {
//     const fetchPartyOptions = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('/api/outstanding/party');
//         setPartyOptions(response.data);
//       } catch (error) {
//         console.error('Error fetching party options:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPartyOptions();
//   }, []);

//   useEffect(() => {
//     const fetchPartyOptions = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get('/api/outstanding/party');
//         if (response.data && response.data.length > 0) {
//           setPartyOptions(response.data);
//         } else {
//           setPartyOptions([]); // Ensure partyOptions is empty if no data found
//         }
//       } catch (error) {
//         console.error('Error fetching party options:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchPartyOptions();
//   }, []);
  


//   // Fetch outstanding data when `fromDate`, `toDate`, or `selectedParty` changes
//   useEffect(() => {
//     const fetchOutstanding = async () => {
//       try {
//         setLoading(true);

//         const formattedFromDate = formatDate(fromDate);
//         const formattedToDate = formatDate(toDate);

//         // Sending parameters to the API
//         const params = {
//           myTypes: selectedMyType, // Send single selected type
//           fromDate: formattedFromDate,
//           toDate: formattedToDate,
//           partyCode: selectedParty,
//         };

//         const res = await axios.get('/api/outstanding/transactions', { params });

//         if (res.status === 200) {
//           setTransactions(res.data);
//         }
//       } catch (err) {
//         console.error('Error fetching outstanding data:', err);
//         alert('An error occurred while fetching the data. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOutstanding();
//   }, [fromDate, toDate, selectedParty, selectedMyType]);

//   // Fetch available types for MyTypes
//   useEffect(() => {
//     const fetchMyTypes = async () => {
//       try {
//         const response = await axios.get('/api/outstanding/mytypes');
//         setMyTypes(response.data);
//       } catch (error) {
//         console.error('Error fetching MyTypes:', error);
//       }
//     };

//     fetchMyTypes();
//   }, []);

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Outstanding Report</h1>

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//         <div>
//           <label className="block mb-1">MyType</label>
//           <select
//             value={selectedMyType}
//             onChange={(e) => setSelectedMyType(e.target.value)}
//             className="w-full p-2 border rounded"
//           >
//             {myTypes.map((type) => (
//               <option key={type} value={type}>
//                 {type}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block mb-1">From Date</label>
//           <DatePicker
//             selected={fromDate}
//             onChange={(date: Date) => setFromDate(date)}
//             dateFormat="dd-MMM-yyyy"
//             className="w-full p-2 border rounded"
//           />
//         </div>

//         <div>
//           <label className="block mb-1">To Date</label>
//           <DatePicker
//             selected={toDate}
//             onChange={(date: Date) => setToDate(date)}
//             dateFormat="dd-MMM-yyyy"
//             className="w-full p-2 border rounded"
//           />
//         </div>

//         <div>
//           <label className="block mb-1">Party</label>
//           <select
//             value={selectedParty}
//             onChange={(e) => setSelectedParty(e.target.value)}
//             className="w-full p-2 border rounded"
//           >
//             <option value="">All Parties</option>
//             {partyList.map((party) => (
//               <option key={party.value} value={party.value}>
//                 {party.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <button
//         onClick={() => {}}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         disabled={loading}
//       >
//         {loading ? 'Loading...' : 'Get Outstanding'}
//       </button>

//       {/* Table */}
//       <div className="mt-8 overflow-auto">
//         <table className="min-w-full border">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border px-4 py-2">Party Code</th>
//               <th className="border px-4 py-2">Party</th>
//               <th className="border px-4 py-2">Type</th>
//               <th className="border px-4 py-2">Voucher No</th>
//               <th className="border px-4 py-2">Date</th>
//               <th className="border px-4 py-2">Amount</th>
//               <th className="border px-4 py-2">Adjusted</th>
//               <th className="border px-4 py-2">Outstanding</th>
//             </tr>
//           </thead>
//           <tbody>
//             {transactions.map((row, index) => (
//               <tr key={index} className="hover:bg-gray-50">
//                 <td className="border px-4 py-2">{row.PartyCode}</td>
//                 <td className="border px-4 py-2">{row.Party}</td>
//                 <td className="border px-4 py-2">{row.MyType}</td>
//                 <td className="border px-4 py-2">{row.VNo}</td>
//                 <td className="border px-4 py-2">{row.UsrDate?.slice(0, 10)}</td>
//                 <td className="border px-4 py-2 text-right">{row.VAmt}</td>
//                 <td className="border px-4 py-2 text-right">{row.AdjAmt}</td>
//                 <td className="border px-4 py-2 text-right font-semibold text-blue-700">
//                   {row.OS}
//                 </td>
//               </tr>
//             ))}
//             {transactions.length === 0 && (
//               <tr>
//                 <td colSpan={8} className="text-center p-4 text-gray-500">
//                   No data found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
