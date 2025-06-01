
"use client";
import React, { useEffect, useState } from 'react';

export default function InwardRatesPage() {
  // your existing states
  const [itemName, setItemName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // new states for suggestions
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);
  
  // debounce states (existing)
  const [debouncedItemName, setDebouncedItemName] = useState('');
  const [debouncedSupplierName, setDebouncedSupplierName] = useState('');

  // fetch suggestion lists once on mount
  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await fetch('/api/InwardRates/suggestions');
        const json = await res.json();
        setItemSuggestions(json.itemNames || []);
        setSupplierSuggestions(json.supplierIds || []);
      } catch (err) {
        console.error('Failed to load suggestions', err);
      }
    }
    fetchSuggestions();
  }, []);

  // your debounce logic (unchanged)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedItemName(itemName);
      setDebouncedSupplierName(supplierName);
    }, 500);
    return () => clearTimeout(handler);
  }, [itemName, supplierName]);

  // fetch data (unchanged)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (debouncedItemName) query.append('ItemName', debouncedItemName);
        if (debouncedSupplierName) query.append('SupplierName', debouncedSupplierName);
        query.append('limit', '20');
        const res = await fetch(`/api/InwardRates?${query.toString()}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
      setLoading(false);
    }
    fetchData();
  }, [debouncedItemName, debouncedSupplierName]);

  // Filter suggestions based on user input
  const filteredItemSuggestions = itemSuggestions.filter(s =>
    s.toLowerCase().includes(itemName.toLowerCase()) && s.toLowerCase() !== itemName.toLowerCase()
  ).slice(0, 5);

  const filteredSupplierSuggestions = supplierSuggestions.filter(s =>
    s.toLowerCase().includes(supplierName.toLowerCase()) && s.toLowerCase() !== supplierName.toLowerCase()
  ).slice(0, 5);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inward Rates</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/2 relative">
          <input
            type="text"
            placeholder="Search Item Name..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            autoComplete="off"
          />
          {itemName && (
            <button
              onClick={() => setItemName('')}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
          {/* Suggestions dropdown */}
          {itemName && filteredItemSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-y-auto rounded-b-md shadow-md">
              {filteredItemSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onClick={() => setItemName(suggestion)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full sm:w-1/2 relative">
          <input
            type="text"
            placeholder="Search Supplier..."
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            autoComplete="off"
          />
          {supplierName && (
            <button
              onClick={() => setSupplierName('')}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
         
          {supplierName && filteredSupplierSuggestions.length > 0 &&  (
            <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-y-auto rounded-b-md shadow-md">
              {filteredSupplierSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onClick={() => setSupplierName(suggestion)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border">Invoice No</th>
                <th className="px-4 py-2 text-left border">Invoice Date</th>
                <th className="px-4 py-2 text-left border">Item Name</th>
                <th className="px-4 py-2 text-left border">Supplier</th>
                <th className="px-4 py-2 text-left border">Rate</th>
                <th className="px-4 py-2 text-left border">MRP</th>
                <th className="px-4 py-2 text-left border">GST</th>
                <th className="px-4 py-2 text-left border">Discount %</th>
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? (
                data.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{item.InvoiceNo}</td>
                    <td className="px-4 py-2 border">
                      {new Date(item.InvoiceDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-2 border">{item.ItemName}</td>
                    <td className="px-4 py-2 border">{item.SupplierName}</td>
                    <td className="px-4 py-2 border">{item.Rate}</td>
                    <td className="px-4 py-2 border">{item.MRP}</td>
                    <td className="px-4 py-2 border">{item.GST}</td>
                    <td className="px-4 py-2 border">{item.Discount_Per}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center px-4 py-6 text-gray-500">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



// 'use client';

// import { useEffect, useState } from 'react';

// export default function InwardRatesPage() {
//   const [itemName, setItemName] = useState('');
//   const [supplierName, setSupplierName] = useState('');
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Debounce inputs
//   const [debouncedItemName, setDebouncedItemName] = useState('');
//   const [debouncedSupplierName, setDebouncedSupplierName] = useState('');

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedItemName(itemName);
//       setDebouncedSupplierName(supplierName);
//     }, 500); // 0.5 sec delay

//     return () => clearTimeout(handler);
//   }, [itemName, supplierName]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const query = new URLSearchParams();
//         if (debouncedItemName) query.append('ItemName', debouncedItemName);
//         if (debouncedSupplierName) query.append('SupplierName', debouncedSupplierName);
//         query.append('limit', '20');

//         const res = await fetch(`/api/InwardRates?${query.toString()}`);
//         const json = await res.json();
//         setData(json);
//       } catch (error) {
//         console.error('Failed to fetch data:', error);
//       }
//       setLoading(false);
//     };

//     fetchData();
//   }, [debouncedItemName, debouncedSupplierName]);

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Inward Rates</h1>

//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <div className="w-full sm:w-1/2 relative">
//           <input
//             type="text"
//             placeholder="Search Item Name..."
//             value={itemName}
//             onChange={(e) => setItemName(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-md"
//           />
//           {itemName && (
//             <button
//               onClick={() => setItemName('')}
//               className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
//             >
//               ×
//             </button>
//           )}
//         </div>
//         <div className="w-full sm:w-1/2 relative">
//           <input
//             type="text"
//             placeholder="Search Supplier..."
//             value={supplierName}
//             onChange={(e) => setSupplierName(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-md"
//           />
//           {supplierName && (
//             <button
//               onClick={() => setSupplierName('')}
//               className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
//             >
//               ×
//             </button>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center text-gray-600">Loading...</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                       <th className="px-4 py-2 text-left border">Invoice No</th>
//                 <th className="px-4 py-2 text-left border">Invoice Date</th>
//                 <th className="px-4 py-2 text-left border">Item Name</th>
//                 <th className="px-4 py-2 text-left border">Supplier</th>
//                 <th className="px-4 py-2 text-left border">Rate</th>
                        
//             <th className="px-4 py-2 text-left border">MRP</th>
//             <th className="px-4 py-2 text-left border">GST</th>
//             <th className="px-4 py-2 text-left border">Discount %</th>
                
          
//               </tr>
//             </thead>
//             <tbody>
//               {data?.length > 0 ? (
//                 data.map((item: any, index: number) => (
//                   <tr key={index} className="hover:bg-gray-50">
            //            <td className="px-4 py-2 border">{item.InvoiceNo}</td>
            //         <td className="px-4 py-2 border">{new Date(item.InvoiceDate).toLocaleDateString('en-IN')}</td>
            //         <td className="px-4 py-2 border">{item.ItemName}</td>
            //         <td className="px-4 py-2 border">{item.SupplierName}</td>
            //         <td className="px-4 py-2 border">{item.Rate}</td>
            //                       <td className="px-4 py-2 border">{item.MRP}</td>
            //   <td className="px-4 py-2 border">{item.GST}</td>
            //   <td className="px-4 py-2 border">{item.Discount_Per}</td>
                 
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="text-center px-4 py-6 text-gray-500">
//                     No data found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }






// 'use client';

// import React, { useState, useEffect } from 'react';

// interface InwardRate {
//   SupplierName: string;
//   InvoiceNo: string;
//   InvoiceDate: string;
//   Rate: number;
//   MRP: number;
//   GST: number;
//   Discount_Per: number;
//   MyId: number;
//   LedId_Supplier?: number;
//   ItemName: string;
// }

// export default function InwardRatesPage() {
//   const [data, setData] = useState<InwardRate[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [itemName, setItemName] = useState('');
//   const [supplierId, setSupplierId] = useState('');
//   const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
// const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);


//   const fetchData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();
//       if (itemName.trim()) params.append('ItemName', itemName.trim());
//       if (supplierId.trim()) params.append('LedId_Supplier', supplierId.trim());

//       const url = params.toString()
//         ? `/api/InwardRates?${params.toString()}`
//         : '/api/InwardRates';

//       const res = await fetch(url, { cache: 'no-store' });

//       if (!res.ok) {
//         throw new Error(`Error: ${res.status}`);
//       }

//       const jsonData: InwardRate[] = await res.json();
//       setData(jsonData);
//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch data');
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//   const fetchSuggestions = async () => {
//     try {
//       const res = await fetch('/api/InwardRates/suggestions'); // Create this API
//       const json = await res.json();
//       setItemSuggestions(json.itemNames || []);
//       setSupplierSuggestions(json.supplierIds || []);
//     } catch (err) {
//       console.error('Failed to fetch suggestions');
//     }
//   };

//   fetchSuggestions();
// }, []);

//   // Fetch all records on mount


//   useEffect(() => {
//     fetchData();
//   }, []);

//   const onSearch = () => {
//     fetchData();
//   };

//   return (
//     <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
//       <h1>Inward Rates</h1>

//       <div style={{ marginBottom: 20 }}>
//         <input
//   type="text"
//   placeholder="Filter by ItemName"
//   list="item-suggestions"
//   value={itemName}
//   onChange={(e) => setItemName(e.target.value)}
//   style={{ marginRight: 10, padding: 5 }}
// />
// <datalist id="item-suggestions">
//   {itemSuggestions.map((item, idx) => (
//     <option key={idx} value={item} />
//   ))}
// </datalist>

// <input
//   type="text"
//   placeholder="Filter by Supplier ID"
//   list="supplier-suggestions"
//   value={supplierId}
//   onChange={(e) => setSupplierId(e.target.value)}
//   style={{ marginRight: 10, padding: 5 }}
// />
// <datalist id="supplier-suggestions">
//   {supplierSuggestions.map((supplier, idx) => (
//     <option key={idx} value={supplier} />
//   ))}
// </datalist>

//         <button onClick={onSearch} disabled={loading}>
//           {loading ? 'Loading...' : 'Search'}
//         </button>
//       </div>

//       {error && <div style={{ color: 'red', marginBottom: 20 }}>{error}</div>}

//       <table
//         border={1}
//         cellPadding={6}
//         cellSpacing={0}
//         style={{ width: '100%', borderCollapse: 'collapse' }}
//       >
//         <thead>
//           <tr>
//             <th>Supplier Name</th>
//             <th>Invoice No</th>
//             <th>Invoice Date</th>
//             <th>Item Name</th>
            // <th>Rate</th>
            // <th>MRP</th>
            // <th>GST</th>
            // <th>Discount %</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.length === 0 && !loading && (
//             <tr>
//               <td colSpan={8} style={{ textAlign: 'center' }}>
//                 No data found.
//               </td>
//             </tr>
//           )}
//           {data.map((row, index) => (
//             <tr key={`${row.MyId}-${index}`}>
//               <td>{row.SupplierName}</td>
//               <td>{row.InvoiceNo}</td>
//               <td>{new Date(row.InvoiceDate).toLocaleDateString()}</td>
//               <td>{row.ItemName}</td>
//               <td>{row.Rate}</td>
            //   <td>{row.MRP}</td>
            //   <td>{row.GST}</td>
            //   <td>{row.Discount_Per}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
