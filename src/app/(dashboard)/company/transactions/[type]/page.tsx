
"use client";
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';

// Transaction record type
interface TransactionDetail {
  UsrDate: string;
  VAmt: number;
  MyType: string;
  PartyCode: string;
  Party: string;
  CityArea: string;
  [key: string]: any;
}

type Option = { label: string; value: string };

const TransactionDetailsPage: React.FC = () => {
  const params = useParams();
  const myTypeParam = params.type;
  const myType = Array.isArray(myTypeParam) ? myTypeParam[0] : myTypeParam;

  const searchParams = useSearchParams();
  const initFromDate = searchParams.get('fromDate');
  const initToDate = searchParams.get('toDate');
  const initParty = searchParams.get('party') || '';

  const [details, setDetails] = useState<TransactionDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filterFromDate, setFilterFromDate] = useState<Date>(
    initFromDate ? new Date(initFromDate) : new Date()
  );
  const [filterToDate, setFilterToDate] = useState<Date>(
    initToDate ? new Date(initToDate) : new Date()
  );

  const [partyOptions, setPartyOptions] = useState<Option[]>([]);
  const [partySelection, setPartySelection] = useState<Option | null>(
    initParty
      ? { value: initParty.split(' - ')[0], label: initParty }
      : null
  );

  // Filter fields
  const [filterMyType, setFilterMyType] = useState('');
  const [filterUsrDate, setFilterUsrDate] = useState('');
  const [filterPartyCode, setFilterPartyCode] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [filterCityArea, setFilterCityArea] = useState('');

  // Load party suggestions
  useEffect(() => {
    axios
      .get<any[]>('/api/party')
      .then(({ data }) => {
        const opts: Option[] = data.map(item => {
          const label = item.label || `${item.PartyCode} - ${item.Party}`;
          const value = item.value || item.PartyCode;
          return { label, value };
        });
        setPartyOptions(opts);
      })
      .catch(err => console.error('Error loading parties:', err));
  }, []);

  const fetchDetails = async (from: string, to: string, partyVal?: string) => {
    if (!myType) return;
    setLoading(true);
    setError('');
    try {
      const url = new URL('/api/transaction-details', window.location.origin);
      url.searchParams.set('myType', myType);
      url.searchParams.set('fromDate', from);
      url.searchParams.set('toDate', to);
      if (partyVal) url.searchParams.set('party', partyVal);
      const res = await fetch(url.toString());
      const data = await res.json();
      setDetails(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve transaction details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const from = filterFromDate.toISOString().split('T')[0];
    const to = filterToDate.toISOString().split('T')[0];
    const partyVal = partySelection?.value;
    fetchDetails(from, to, partyVal || undefined);
  };

  const filteredData = details.filter(row =>
    row.MyType.toLowerCase().includes(filterMyType.toLowerCase()) &&
    row.UsrDate.toLowerCase().includes(filterUsrDate.toLowerCase()) &&
    row.PartyCode.toLowerCase().includes(filterPartyCode.toLowerCase()) &&
    row.Party.toLowerCase().includes(filterParty.toLowerCase()) &&
    row.CityArea.toLowerCase().includes(filterCityArea.toLowerCase())
  );

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Transactions for {myType}</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">From Date</label>
            <DatePicker
              selected={filterFromDate}
              onChange={(d:Date | null) =>  setFilterFromDate(d)}
              dateFormat="dd-MMM-yyyy"
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">To Date</label>
            <DatePicker
              selected={filterToDate}
              onChange={(d:Date | null ) =>  setFilterToDate(d)}
              dateFormat="dd-MMM-yyyy"
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Party (optional)</label>
            <Select
              options={partyOptions}
              value={partySelection}
              onChange={opt => setPartySelection(opt)}
              isClearable
              placeholder="Select party..."
              className="mt-1"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              GO
            </button>
          </div>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4">
        {loading ? (
          <div>Loading transaction details...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">List Of Transactions:</h2>
            {/* Table rendering unchanged */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].map(header => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                    {details.length > 0 &&
                      Object.keys(details[0])
                        .filter(key => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key))
                        .map(key => (
                          <th
                            key={`header-${key}`}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                  </tr>

                  {/* Filter inputs */}
                  <tr className="bg-gray-50">
                    <th className="px-6 py-2">
                      <input
                        type="text"
                        placeholder="Filter MyType"
                        value={filterMyType}
                        onChange={(e) => setFilterMyType(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      />
                    </th>
                    <th className="px-6 py-2">
                      <input
                        type="text"
                        placeholder="Filter UsrDate"
                        value={filterUsrDate}
                        onChange={(e) => setFilterUsrDate(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      />
                    </th>
                    <th className="px-6 py-2">
                      <input
                        type="text"
                        placeholder="Filter PartyCode"
                        value={filterPartyCode}
                        onChange={(e) => setFilterPartyCode(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      />
                    </th>
                    <th className="px-6 py-2">
                      <input
                        type="text"
                        placeholder="Filter Party"
                        value={filterParty}
                        onChange={(e) => setFilterParty(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      />
                    </th>
                    <th className="px-6 py-2">
                      <input
                        type="text"
                        placeholder="Filter CityArea"
                        value={filterCityArea}
                        onChange={(e) => setFilterCityArea(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
                      />
                    </th>
                    {details.length > 0 &&
                      Object.keys(details[0])
                        .filter(key => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key))
                        .map(key => (
                          <th key={`filter-${key}`} className="px-6 py-2"></th>
                        ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((row, index) => (
                    <tr key={`row-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.MyType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(row.UsrDate).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.PartyCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Party}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.CityArea}</td>
                      {Object.keys(row)
                        .filter(key => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key))
                        .map(key => (
                          <td key={`cell-${index}-${key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row[key]}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        
          </div>
        )}
      </div>
    </main>
  );
};

export default TransactionDetailsPage;




// 'use client';

// import React, { useEffect, useState } from 'react';
// import DatePicker from 'react-datepicker';
// import { useParams, useSearchParams } from 'next/navigation';
// import axios from 'axios';
// import 'react-datepicker/dist/react-datepicker.css';

// // Transaction record type
// type TransactionDetail = {
//   UsrDate: string;
//   VAmt: number;
//   MyType: string;
//   PartyCode: string;
//   Party: string;
//   CityArea: string;
//   [key: string]: any; // to handle dynamic keys
// };

// const TransactionDetailsPage: React.FC = () => {
//   const params = useParams();
//   const myTypeParam = params.type;
//   const myType = Array.isArray(myTypeParam) ? myTypeParam[0] : myTypeParam;

//   const searchParams = useSearchParams();
//   const initFromDate = searchParams.get('fromDate');
//   const initToDate = searchParams.get('toDate');
//   const initParty = searchParams.get('party') || '';

//   const [details, setDetails] = useState<TransactionDetail[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const [filterFromDate, setFilterFromDate] = useState<Date>(
//     initFromDate ? new Date(initFromDate) : new Date()
//   );
//   const [filterToDate, setFilterToDate] = useState<Date>(
//     initToDate ? new Date(initToDate) : new Date()
//   );

//   const [partyList, setPartyList] = useState<string[]>([]);
//   const [partyInput, setPartyInput] = useState<string>(initParty);

//   // Filter fields
//   const [filterMyType, setFilterMyType] = useState('');
//   const [filterUsrDate, setFilterUsrDate] = useState('');
//   const [filterPartyCode, setFilterPartyCode] = useState('');
//   const [filterParty, setFilterParty] = useState('');
//   const [filterCityArea, setFilterCityArea] = useState('');

//   // Load party suggestions
//   useEffect(() => {
//     axios.get<any[]>('/api/party')
//       .then(({ data }) => {
//         const list = data.map(item => {
//           if (item.value && item.label) {
//             return item.label;
//           }
//           if (item.PartyCode && item.Party) {
//             return `${item.PartyCode} - ${item.Party}`;
//           }
//           if (typeof item === 'string') {
//             return item;
//           }
//           return JSON.stringify(item);
//         });
//         setPartyList(list);
//         setPartyInput(initParty);
//       })
//       .catch(err => console.error('Error loading parties:', err));
//   }, [initParty]);

//   const fetchDetails = async (from: string, to: string, partyVal: string | null) => {
//     if (!myType) return;
//     setLoading(true);
//     setError('');
//     try {
//       const url = new URL('/api/transaction-details', window.location.origin);
//       url.searchParams.set('myType', myType);
//       url.searchParams.set('fromDate', from);
//       url.searchParams.set('toDate', to);
//       if (partyVal) url.searchParams.set('party', partyVal);
//       const res = await fetch(url.toString());
     
//       const data = await res.json();
//       console.log("data", data);
//       setDetails(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to retrieve transaction details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const from = filterFromDate.toISOString().split('T')[0];
//     const to = filterToDate.toISOString().split('T')[0];
//     const partyVal = partyInput.split(' - ')[0] || null;
//     fetchDetails(from, to, partyVal);
//   };

//   const filteredData = details.filter(row =>
//     row.MyType.toLowerCase().includes(filterMyType.toLowerCase()) &&
//     row.UsrDate.toLowerCase().includes(filterUsrDate.toLowerCase()) &&
//     row.PartyCode.toLowerCase().includes(filterPartyCode.toLowerCase()) &&
//     row.Party.toLowerCase().includes(filterParty.toLowerCase()) &&
//     row.CityArea.toLowerCase().includes(filterCityArea.toLowerCase())
//   );

//   return (
//     <main className="p-8 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold mb-4">Transactions for {myType}</h1>

//       <form onSubmit={handleSubmit} className="mb-8 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium">From Date</label>
//             <DatePicker
//               selected={filterFromDate}
//               onChange={(d: Date | null) => d && setFilterFromDate(d)}
//               dateFormat="dd-MMM-yyyy"
//               className="mt-1 w-full rounded border px-3 py-2"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">To Date</label>
//             <DatePicker
//               selected={filterToDate}
//               onChange={(d: Date | null) => d && setFilterToDate(d)}
//               dateFormat="dd-MMM-yyyy"
//               className="mt-1 w-full rounded border px-3 py-2"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium" htmlFor="partyListInput">
//               Party
//             </label>
//             <input
//               list="partyList"
//               id="partyListInput"
//               value={partyInput}
//               onChange={e => setPartyInput(e.target.value)}
//               placeholder="Type or select party"
//               className="mt-1 w-full rounded border px-3 py-2"
//             />
//             <datalist id="partyList">
//               {partyList.map((p, idx) => (
//                 <option key={idx} value={p} />
//               ))}
//             </datalist>
//           </div>

//           <div className="flex items-end">
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//             >
//               GO
//             </button>
//           </div>
//         </div>
//       </form>

//       <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4">
//         {loading ? (
//           <div>Loading transaction details...</div>
//         ) : (
//           <div className="mt-8">
//             <h2 className="text-xl font-semibold mb-4">List Of Transactions:</h2>
        //     <div className="overflow-x-auto">
        //       <table className="min-w-full divide-y divide-gray-200">
        //         <thead className="bg-gray-50">
        //           <tr>
        //             {['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].map(header => (
        //               <th
        //                 key={header}
        //                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        //               >
        //                 {header}
        //               </th>
        //             ))}
        //             {details.length > 0 &&
        //               Object.keys(details[0])
        //                 .filter(key => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key))
        //                 .map(key => (
        //                   <th
        //                     key={`header-${key}`}
        //                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        //                   >
        //                     {key}
        //                   </th>
        //                 ))}
        //           </tr>

        //           {/* Filter inputs */}
        //           <tr className="bg-gray-50">
        //             <th className="px-6 py-2">
        //               <input
        //                 type="text"
        //                 placeholder="Filter MyType"
        //                 value={filterMyType}
        //                 onChange={(e) => setFilterMyType(e.target.value)}
        //                 className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
        //               />
        //             </th>
        //             <th className="px-6 py-2">
        //               <input
        //                 type="text"
        //                 placeholder="Filter UsrDate"
        //                 value={filterUsrDate}
        //                 onChange={(e) => setFilterUsrDate(e.target.value)}
        //                 className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
        //               />
        //             </th>
        //             <th className="px-6 py-2">
        //               <input
        //                 type="text"
        //                 placeholder="Filter PartyCode"
        //                 value={filterPartyCode}
        //                 onChange={(e) => setFilterPartyCode(e.target.value)}
        //                 className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
        //               />
        //             </th>
        //             <th className="px-6 py-2">
        //               <input
        //                 type="text"
        //                 placeholder="Filter Party"
        //                 value={filterParty}
        //                 onChange={(e) => setFilterParty(e.target.value)}
        //                 className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
        //               />
        //             </th>
        //             <th className="px-6 py-2">
        //               <input
        //                 type="text"
        //                 placeholder="Filter CityArea"
        //                 value={filterCityArea}
        //                 onChange={(e) => setFilterCityArea(e.target.value)}
        //                 className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
        //               />
        //             </th>
        //             {details.length > 0 &&
        //               Object.keys(details[0])
        //                 .filter(key => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key))
        //                 .map(key => (
        //                   <th key={`filter-${key}`} className="px-6 py-2"></th>
        //                 ))}
        //           </tr>
        //         </thead>

        //         <tbody className="bg-white divide-y divide-gray-200">
        //           {filteredData.map((row, index) => (
        //             <tr key={`row-${index}`}>
        //               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.MyType}</td>
        //               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(row.UsrDate).toLocaleDateString('en-GB')}</td>
        //               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.PartyCode}</td>
        //               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Party}</td>
        //               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.CityArea}</td>
        //               {Object.keys(row)
        //                 .filter(key => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key))
        //                 .map(key => (
        //                   <td key={`cell-${index}-${key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        //                     {row[key]}
        //                   </td>
        //                 ))}
        //             </tr>
        //           ))}
        //         </tbody>
        //       </table>
        //     </div>
        //   </div>
        // )}
//       </div>
//     </main>
//   );
// };

// export default TransactionDetailsPage;

