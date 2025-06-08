'use client';

import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

// Custom input component for react-datepicker to force lower-case display.
const CustomInput = React.forwardRef(
  (
    { value, onClick, onChange, placeholder }: { value?: string; onClick?: () => void; onChange?: (e: any) => void; placeholder?: string },
    ref: React.Ref<HTMLInputElement>
  ) => (
    <input
      type="text"
      readOnly
      className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      onClick={onClick}
      onChange={onChange}
      ref={ref}
      value={value ? value.toLowerCase() : ''}
      placeholder={placeholder}
    />
  )
);

CustomInput.displayName = 'CustomInput';

export default function TransactionQuery() {
  // Query parameters
  const [pCoId, setPCoId] = useState('');
  const [pYrId, setPYrId] = useState('');
  const [pFrmDate, setPFrmDate] = useState<Date | null>(null);
  const [pToDate, setPToDate] = useState<Date | null>(null);

  // API response and error state
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Individual column filter states
  const [filterMyType, setFilterMyType] = useState('');
  const [filterUsrDate, setFilterUsrDate] = useState('');
  const [filterPartyCode, setFilterPartyCode] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [filterCityArea, setFilterCityArea] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponseData(null);

    try {
      // Format the dates as "dd-MMM-yyyy" and then convert them to lowercase.
      const formattedFrmDate = pFrmDate ? format(pFrmDate, 'dd-MMM-yyyy').toLowerCase() : '';
      const formattedToDate = pToDate ? format(pToDate, 'dd-MMM-yyyy').toLowerCase() : '';

      // Send the payload. Axios will send JSON.
      const { data } = await axios.post('/api/transection', {
        pCoId,
        pYrId,
        pFrmDate: formattedFrmDate,
        pToDate: formattedToDate,
      });
      setResponseData(data);
    } catch (err) {
      console.error('Error fetching API:', err);
      setError('Failed to fetch transaction data.');
    }
  };

  // Apply individual filters for table columns if responseData.data exists.
  const filteredData = responseData?.data
    ? responseData.data.filter((row: any) => {
        return (
          (!filterMyType ||
            String(row.MyType).toLowerCase().includes(filterMyType.toLowerCase())) &&
          (!filterUsrDate ||
            String(row.UsrDate).toLowerCase().includes(filterUsrDate.toLowerCase())) &&
          (!filterPartyCode ||
            String(row.PartyCode).toLowerCase().includes(filterPartyCode.toLowerCase())) &&
          (!filterParty ||
            String(row.Party).toLowerCase().includes(filterParty.toLowerCase())) &&
          (!filterCityArea ||
            String(row.CityArea).toLowerCase().includes(filterCityArea.toLowerCase()))
        );
      })
    : [];

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Transaction Details</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="pCoId" className="block text-sm font-medium text-gray-700">
              Company ID
            </label>
            <input
              type="number"
              id="pCoId"
              value={pCoId}
              onChange={(e) => setPCoId(e.target.value)}
              placeholder="Enter Company ID"
              className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="pYrId" className="block text-sm font-medium text-gray-700">
              Year ID
            </label>
            <input
              type="number"
              id="pYrId"
              value={pYrId}
              onChange={(e) => setPYrId(e.target.value)}
              placeholder="Enter Year ID"
              className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="pFrmDate" className="block text-sm font-medium text-gray-700">
              From Date
            </label>
            <DatePicker
              id="pFrmDate"
              selected={pFrmDate}
              onChange={(date: Date | null) => setPFrmDate(date)}
              dateFormat="dd-MMM-yyyy"
              customInput={<CustomInput placeholder="Select From Date" />}
              required
            />
          </div>
          <div>
            <label htmlFor="pToDate" className="block text-sm font-medium text-gray-700">
              To Date
            </label>
            <DatePicker
              id="pToDate"
              selected={pToDate}
              onChange={(date: Date | null) => setPToDate(date)}
              dateFormat="dd-MMM-yyyy"
              customInput={<CustomInput placeholder="Select To Date" />}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            GO
          </button>
        </div>
      </form>

      {responseData && responseData.data && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">List Of Transactions:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MyType
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UsrDate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PartyCode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CityArea
                  </th>
                  {responseData.data.length > 0 &&
                    Object.keys(responseData.data[0])
                      .filter(
                        (key) => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key)
                      )
                      .map((key) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key}
                        </th>
                      ))}
                </tr>
                <tr>
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
                  {responseData.data.length > 0 &&
                    Object.keys(responseData.data[0])
                      .filter(
                        (key) => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key)
                      )
                      .map((key) => (
                        <th key={key} className="px-6 py-2"></th>
                      ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.MyType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.UsrDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.PartyCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Party}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.CityArea}</td>
                    {Object.keys(row)
                      .filter(
                        (key) => !['MyType', 'UsrDate', 'PartyCode', 'Party', 'CityArea'].includes(key)
                      )
                      .map((key) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row[key]}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <p className="text-center text-gray-500 py-4">No records found.</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-8 text-red-600">{error}</p>}
    </main>
  );
}





// 'use client';

// import React, { useState } from 'react';
// import axios from 'axios';

// export default function TransactionQuery() {
//   // Query parameters
//   const [pCoId, setPCoId] = useState('');
//   const [pYrId, setPYrId] = useState('');
//   const [pFrmDate, setPFrmDate] = useState('');
//   const [pToDate, setPToDate] = useState('');

//   // API response and error state
//   const [responseData, setResponseData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Individual column filter states
//   const [filterMyType, setFilterMyType] = useState('');
//   const [filterUsrDate, setFilterUsrDate] = useState('');
//   const [filterPartyCode, setFilterPartyCode] = useState('');
//   const [filterParty, setFilterParty] = useState('');
//   const [filterCityArea, setFilterCityArea] = useState('');

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     setError(null);
//     setResponseData(null);

//     try {
//       // Send only the payload. Axios automatically sets the method to POST and sends JSON.
//       const { data } = await axios.post('/api/transection', {
//         pCoId,
//         pYrId,
//         pFrmDate,
//         pToDate,
//       });
//       setResponseData(data);
//     } catch (err) {
//       console.error('Error fetching API:', err);
//       setError('Failed to fetch transaction data.');
//     }
//   };

//   // Apply individual filters for specific columns if responseData.data exists
//   const filteredData = responseData?.data
//     ? responseData.data.filter((row: any) => {
//         return (
//           (!filterMyType ||
//             String(row.MyType).toLowerCase().includes(filterMyType.toLowerCase())) &&
//           (!filterUsrDate ||
//             String(row.UsrDate).toLowerCase().includes(filterUsrDate.toLowerCase())) &&
//           (!filterPartyCode ||
//             String(row.PartyCode).toLowerCase().includes(filterPartyCode.toLowerCase())) &&
//           (!filterParty ||
//             String(row.Party).toLowerCase().includes(filterParty.toLowerCase())) &&
//           (!filterCityArea ||
//             String(row.CityArea).toLowerCase().includes(filterCityArea.toLowerCase()))
//         );
//       })
//     : [];

//   return (
//     <main className="p-8">
//       <h1 className="text-3xl font-bold mb-6">Transaction Details</h1>
//       <form onSubmit={handleSubmit} className="mb-8 space-y-4">
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <div>
//             <label htmlFor="pCoId" className="block text-sm font-medium text-gray-700">
//               Company ID
//             </label>
//             <input
//               type="number"
//               id="pCoId"
//               value={pCoId}
//               onChange={(e) => setPCoId(e.target.value)}
//               placeholder="Enter Company ID"
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="pYrId" className="block text-sm font-medium text-gray-700">
//               Year ID
//             </label>
//             <input
//               type="number"
//               id="pYrId"
//               value={pYrId}
//               onChange={(e) => setPYrId(e.target.value)}
//               placeholder="Enter Year ID"
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="pFrmDate" className="block text-sm font-medium text-gray-700">
//               From Date
//             </label>
//             <input
//               type="date"
//               id="pFrmDate"
//               value={pFrmDate}
//               onChange={(e) => setPFrmDate(e.target.value)}
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="pToDate" className="block text-sm font-medium text-gray-700">
//               To Date
//             </label>
//             <input
//               type="date"
//               id="pToDate"
//               value={pToDate}
//               onChange={(e) => setPToDate(e.target.value)}
//               className="mt-1 block w-full rounded-md border shadow-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="mt-4 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//           >
//             GO
//           </button>
//         </div>
//       </form>

//       {responseData && responseData.data && (
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold mb-4">List Of Transactions:</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     MyType
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     UsrDate
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     PartyCode
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Party
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     CityArea
//                   </th>
//                   {/* Additional headers */}
//                   {responseData.data.length > 0 &&
//                     Object.keys(responseData.data[0])
//                       .filter(key => !["MyType", "UsrDate", "PartyCode", "Party", "CityArea"].includes(key))
//                       .map((key) => (
//                         <th
//                           key={key}
//                           className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                         >
//                           {key}
//                         </th>
//                       ))}
//                 </tr>
//                 <tr>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter MyType"
//                       value={filterMyType}
//                       onChange={(e) => setFilterMyType(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter UsrDate"
//                       value={filterUsrDate}
//                       onChange={(e) => setFilterUsrDate(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter PartyCode"
//                       value={filterPartyCode}
//                       onChange={(e) => setFilterPartyCode(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter Party"
//                       value={filterParty}
//                       onChange={(e) => setFilterParty(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   <th className="px-6 py-2">
//                     <input
//                       type="text"
//                       placeholder="Filter CityArea"
//                       value={filterCityArea}
//                       onChange={(e) => setFilterCityArea(e.target.value)}
//                       className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
//                     />
//                   </th>
//                   {responseData.data.length > 0 &&
//                     Object.keys(responseData.data[0])
//                       .filter(key => !["MyType", "UsrDate", "PartyCode", "Party", "CityArea"].includes(key))
//                       .map((key) => (
//                         <th key={key} className="px-6 py-2"></th>
//                       ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredData.map((row: any, index: number) => (
//                   <tr key={index}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.MyType}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.UsrDate}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.PartyCode}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.Party}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {row.CityArea}
//                     </td>
//                     {Object.keys(row)
//                       .filter(key => !["MyType", "UsrDate", "PartyCode", "Party", "CityArea"].includes(key))
//                       .map((key) => (
//                         <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {row[key]}
//                         </td>
//                       ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {filteredData.length === 0 && (
//               <p className="text-center text-gray-500 py-4">No records found.</p>
//             )}
//           </div>
//         </div>
//       )}

//       {error && <p className="mt-8 text-red-600">{error}</p>}
//     </main>
//   );
// }
