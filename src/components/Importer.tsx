import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AUTO_IMPORT_INTERVAL = 24 * 60 * 60 * 1000; // 1 minute

// Configure base Financial Year mapping: BASE_FIN_YEAR corresponds to BASE_ID
// Here, ID 5 maps to FY2018-19, ID 6 → FY2019-20, ..., ID 11 → FY2024-25
const BASE_FIN_YEAR = 2018; // Financial year starting 1 Apr 2018–31 Mar 2019
const BASE_ID = 5;         // ID assigned to FY2018-19

function getCurrentFYId() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  // financial year starts on April 1
  const fyStart = month >= 4 ? year : year - 1;
  // offset from BASE_FIN_YEAR
  const offset = fyStart - BASE_FIN_YEAR;
  return BASE_ID + offset;
}

export default function Importer() {
  const [yearInput, setYearInput] = useState<string>('');
  const [selectedYearIds, setSelectedYearIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const autoImportTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value;
    setYearInput(txt);
    const ids = txt
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    setSelectedYearIds(ids);
  };

  const importData = async (ids: number[]) => {
    if (!ids.length) {
      toast.warn('⚠️ Enter at least one valid year ID.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/import-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearIds: ids }),
      });
      if (!res.ok) throw new Error(await res.text() || 'Server error');
      const json = await res.json();
      toast.success(`✅ Imported ${json.imported} rows.`);
    } catch (err: any) {
      toast.error(`❌ Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    importData(selectedYearIds);
    resetAutoImportTimer();
  };

  const resetAutoImportTimer = () => {
    if (autoImportTimer.current) clearTimeout(autoImportTimer.current);
    autoImportTimer.current = setTimeout(() => {
      let idToImport: number;
      if (selectedYearIds.length) {
        // If user has entered IDs, use the highest of those
        idToImport = Math.max(...selectedYearIds);
      } else {
        // Otherwise, use current financial year ID
        idToImport = getCurrentFYId();
      }
      toast.info(`⏱️ Auto-importing ID: ${idToImport}`);
      importData([idToImport]);
    }, AUTO_IMPORT_INTERVAL);
  };

  useEffect(() => {
    resetAutoImportTimer();
    return () => {
      if (autoImportTimer.current) clearTimeout(autoImportTimer.current);
    };
  }, [yearInput]);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Year ID(s) (comma-separated)
      </label>
      <input
        type="text"
        value={yearInput}
        onChange={handleInputChange}
        placeholder="e.g. 5,6,7,8,9,10"
        className="w-full border border-gray-300 rounded p-2 text-black"
      />

      <button
        onClick={handleImport}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Importing…' : 'Import Data'}
      </button>

      {/**
        Financial Year Auto-Import Example:
        - BASE_FIN_YEAR=2018 & BASE_ID=5 →
          ID 5 → FY2018-19,
          ID 6 → FY2019-20,
          ...
          ID 11 → FY2024-25
        - If today is May 2024 → getCurrentFYId() returns 11
        - In March 2025 still returns 11
        - On April 1, 2025 → fyStart=2025 → getCurrentFYId() = 5 + (2025-2018) = 12
      **/}
    </div>
  );
}







// 'use client';

// import { useState } from 'react';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// export default function Importer() {
//   // Raw text & parsed IDs
//   const [yearInput, setYearInput] = useState<string>('');
//   const [selectedYearIds, setSelectedYearIds] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Parse CSV into ints on each keystroke
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const txt = e.target.value;
//     setYearInput(txt);
//     const ids = txt
//       .split(',')
//       .map((s) => parseInt(s.trim(), 10))
//       .filter((n) => !isNaN(n));
//     setSelectedYearIds(ids);
//   };

//   // Fire off the import
//   const handleImport = async () => {
//     if (!selectedYearIds.length) {
//       toast.warn('⚠️ Enter at least one valid year (e.g. 8 or 8,9,10).');
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch('/api/import-data', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ yearIds: selectedYearIds }),
//       });

//       if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(errText || 'Server error');
//       }

//       const json = await res.json();
//       toast.success(`✅ Imported ${json.imported} rows.`);
//     } catch (err: any) {
//       toast.error(`❌ Import failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto space-y-4">
//       <label className="block text-sm font-medium text-gray-700">
//         Year ID(s) (comma-separated)
//       </label>
//       <input
//         type="text"
//         value={yearInput}
//         onChange={handleInputChange}
//         placeholder="e.g. 8,9,10,11"
//         className="w-full border border-gray-300 rounded bg-white p-2 text-black"
//       />

//       <button
//         onClick={handleImport}
//         disabled={loading}
//         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//       >
//         {loading ? 'Importing…' : 'Import Data'}
//       </button>
//     </div>
//   );
// }

