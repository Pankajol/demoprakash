
// "use client";
// import React, { useEffect, useState } from 'react';

// export default function InwardRatesPage() {
//   // your existing states
//   const [itemName, setItemName] = useState('');
//   const [supplierName, setSupplierName] = useState('');
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   // new states for suggestions
//   const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
//   const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);
  
//   // debounce states (existing)
//   const [debouncedItemName, setDebouncedItemName] = useState('');
//   const [debouncedSupplierName, setDebouncedSupplierName] = useState('');

//   // fetch suggestion lists once on mount
//   useEffect(() => {
//     async function fetchSuggestions() {
//       try {
//         const res = await fetch('/api/InwardRates/suggestions');
//         const json = await res.json();
//         setItemSuggestions(json.itemNames || []);
//         setSupplierSuggestions(json.supplierIds || []);
//       } catch (err) {
//         console.error('Failed to load suggestions', err);
//       }
//     }
//     fetchSuggestions();
//   }, []);

//   // your debounce logic (unchanged)
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedItemName(itemName);
//       setDebouncedSupplierName(supplierName);
//     }, 500);
//     return () => clearTimeout(handler);
//   }, [itemName, supplierName]);

//   // fetch data (unchanged)
//   useEffect(() => {
//     async function fetchData() {
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
//     }
//     fetchData();
//   }, [debouncedItemName, debouncedSupplierName]);

//   // Filter suggestions based on user input
//   const filteredItemSuggestions = itemSuggestions.filter(s =>
//     s.toLowerCase().includes(itemName.toLowerCase()) && s.toLowerCase() !== itemName.toLowerCase()
//   ).slice(0, 5);

//   const filteredSupplierSuggestions = supplierSuggestions.filter(s =>
//     s.toLowerCase().includes(supplierName.toLowerCase()) && s.toLowerCase() !== supplierName.toLowerCase()
//   ).slice(0, 5);

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
//             autoComplete="off"
//           />
//           {itemName && (
//             <button
//               onClick={() => setItemName('')}
//               className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
//             >
//               ×
//             </button>
//           )}
//           {/* Suggestions dropdown */}
//           {itemName && filteredItemSuggestions.length > 0 && (
//             <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-y-auto rounded-b-md shadow-md">
//               {filteredItemSuggestions.map((suggestion) => (
//                 <li
//                   key={suggestion}
//                   onClick={() => setItemName(suggestion)}
//                   className="cursor-pointer px-4 py-2 hover:bg-gray-200"
//                 >
//                   {suggestion}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         <div className="w-full sm:w-1/2 relative">
//           <input
//             type="text"
//             placeholder="Search Supplier..."
//             value={supplierName}
//             onChange={(e) => setSupplierName(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-md"
//             autoComplete="off"
//           />
//           {supplierName && (
//             <button
//               onClick={() => setSupplierName('')}
//               className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
//             >
//               ×
//             </button>
//           )}
         
//           {supplierName && filteredSupplierSuggestions.length > 0 &&  (
//             <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-40 overflow-y-auto rounded-b-md shadow-md">
//               {filteredSupplierSuggestions.map((suggestion) => (
//                 <li
//                   key={suggestion}
//                   onClick={() => setSupplierName(suggestion)}
//                   className="cursor-pointer px-4 py-2 hover:bg-gray-200"
//                 >
//                   {suggestion}
//                 </li>
//               ))}
//             </ul>
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
//                 <th className="px-4 py-2 text-left border">Invoice No</th>
//                 <th className="px-4 py-2 text-left border">Invoice Date</th>
//                 <th className="px-4 py-2 text-left border">Item Name</th>
//                 <th className="px-4 py-2 text-left border">Supplier</th>
//                 <th className="px-4 py-2 text-left border">Rate</th>
//                 <th className="px-4 py-2 text-left border">MRP</th>
//                 <th className="px-4 py-2 text-left border">GST</th>
//                 <th className="px-4 py-2 text-left border">Discount %</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data?.length > 0 ? (
//                 data.map((item: any, index: number) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     <td className="px-4 py-2 border">{item.InvoiceNo}</td>
//                     <td className="px-4 py-2 border">
//                       {new Date(item.InvoiceDate).toLocaleDateString('en-IN')}
//                     </td>
//                     <td className="px-4 py-2 border">{item.ItemName}</td>
//                     <td className="px-4 py-2 border">{item.SupplierName}</td>
//                     <td className="px-4 py-2 border">{item.Rate}</td>
//                     <td className="px-4 py-2 border">{item.MRP}</td>
//                     <td className="px-4 py-2 border">{item.GST}</td>
//                     <td className="px-4 py-2 border">{item.Discount_Per}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={8} className="text-center px-4 py-6 text-gray-500">
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


'use client';

import React, { useEffect, useState } from 'react';

export default function InwardRatesPage() {
  // existing states
  const [itemName, setItemName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // suggestions
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);

  // debounced values
  const [debouncedItemName, setDebouncedItemName] = useState('');
  const [debouncedSupplierName, setDebouncedSupplierName] = useState('');

  // fetch suggestion lists once
  useEffect(() => {
    fetch('/api/InwardRates/suggestions')
      .then(res => res.json())
      .then(json => {
        setItemSuggestions(json.itemNames || []);
        setSupplierSuggestions(json.supplierIds || []);
      })
      .catch(console.error);
  }, []);

  // debounce inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedItemName(itemName);
      setDebouncedSupplierName(supplierName);
    }, 500);
    return () => clearTimeout(handler);
  }, [itemName, supplierName]);

  // fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (debouncedItemName) q.append('ItemName', debouncedItemName);
        if (debouncedSupplierName) q.append('SupplierName', debouncedSupplierName);
        q.append('limit', '20');

        const res = await fetch(`/api/InwardRates?${q.toString()}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, [debouncedItemName, debouncedSupplierName]);

  // filtered suggestions
  const filteredItemSuggestions = itemSuggestions
    .filter(s =>
      s.toLowerCase().includes(itemName.toLowerCase()) &&
      s.toLowerCase() !== itemName.toLowerCase()
    )
    .slice(0, 5);

  const filteredSupplierSuggestions = supplierSuggestions
    .filter(s =>
      s.toLowerCase().includes(supplierName.toLowerCase()) &&
      s.toLowerCase() !== supplierName.toLowerCase()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Inward Rates</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Item Name Input */}
          <div className="w-full sm:w-1/2 relative">
            <input
              type="text"
              placeholder="Search Item Name..."
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            {itemName && (
              <button
                onClick={() => setItemName('')}
                className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
            {itemName && filteredItemSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-background border border-gray-300 dark:border-gray-600 w-full max-h-40 overflow-y-auto rounded-b-md shadow-md">
                {filteredItemSuggestions.map(s => (
                  <li
                    key={s}
                    onClick={() => setItemName(s)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Supplier Input */}
          <div className="w-full sm:w-1/2 relative">
            <input
              type="text"
              placeholder="Search Supplier..."
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            {supplierName && (
              <button
                onClick={() => setSupplierName('')}
                className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
            {supplierName && filteredSupplierSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-background border border-gray-300 dark:border-gray-600 w-full max-h-40 overflow-y-auto rounded-b-md shadow-md">
                {filteredSupplierSuggestions.map(s => (
                  <li
                    key={s}
                    onClick={() => setSupplierName(s)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-background border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {['Invoice No','Invoice Date','Item Name','Supplier','Rate','MRP','GST','Discount %'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left border border-gray-200 dark:border-gray-700 text-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{row.InvoiceNo}</td>
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">
                        {new Date(row.InvoiceDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{row.ItemName}</td>
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{row.SupplierName}</td>
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{row.Rate}</td>
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{row.MRP}</td>
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{row.GST}</td>
                      <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">{row.Discount_Per}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center px-4 py-6 text-gray-500 dark:text-gray-400"
                    >
                      No data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
