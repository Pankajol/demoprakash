'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Select, { MultiValue } from 'react-select';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type RecordItem = {
  MyType: string;
  IMonth: number;
  Amt: number;
  YearId: number;
};

type YearOption = { value: number; label: string };
type MyTypeOption = { value: string; label: string };

interface AggregateChartProps {
  availableYears: number[];
}

export default function AggregateChart({ availableYears }: AggregateChartProps) {
  const router = useRouter();
  const [selectedYears, setSelectedYears] = useState<MultiValue<YearOption>>(
    availableYears.map((yr) => ({ value: yr, label: yr.toString() }))
  );
  const [selectedTypes, setSelectedTypes] = useState<MultiValue<MyTypeOption>>([]);
  const [data, setData] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data whenever selectedYears changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const yearIds = selectedYears.map((opt) => opt.value).join(',');
      try {
        const res = await fetch(`/api/aggregate-transactions?yearIds=${yearIds}`);
        const json = (await res.json()) as RecordItem[];
        setData(json);
      } catch (err) {
        console.error('Data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYears.length) fetchData();
    else setData([]);
  }, [selectedYears]);

  // Derive MyType options from fetched data
  const allMyTypes = useMemo(() => {
    const types = Array.from(new Set(data.map((d) => d.MyType)));
    return types.map((type) => ({ value: type, label: type }));
  }, [data]);

  // Prepare chart data and click handler context
  const { chartData, handleBarClick } = useMemo(() => {
    // Filter by selectedTypes if any
    const filtered = selectedTypes.length
      ? data.filter((d) => selectedTypes.some((t) => t.value === d.MyType))
      : data;

    const types = Array.from(new Set(filtered.map((d) => d.MyType)));
    const monthLabels = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('default', { month: 'short' })
    );

    const palette = [
      '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
      '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
    ];

    const datasets = types.flatMap((type, tIdx) =>
      selectedYears.map((yearOpt, yIdx) => {
        const year = yearOpt.value;
        const sums = monthLabels.map((_, mi) => {
          const rec = filtered.find(r => r.MyType === type && r.YearId === year && r.IMonth === mi + 1);
          return rec?.Amt ?? 0;
        });

        return {
          label: `${type} (${year})`,
          data: sums,
          barThickness: 25,
          backgroundColor: palette[(tIdx + yIdx) % palette.length],
          meta: { type, year }, // attach for click
        };
      })
    );

    // Click handling: navigate to detail page
    const handleBarClick = (elements: any[]) => {
      if (!elements.length) return;
      const { datasetIndex, index } = elements[0];
      const ds = datasets[datasetIndex];
      const { type, year } = ds.meta;
      const month = index + 1;
      // route to detail page, e.g. /details?type=...&year=...&month=...
      router.push(`month-trasactions/details?type=${encodeURIComponent(type)}&year=${year}&month=${month}`);
    };

    return {
      chartData: { labels: monthLabels, datasets },
      handleBarClick,
    };
  }, [data, selectedYears, selectedTypes, router]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Compare VAmt by Month</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4 p-4">
        {/* Year Picker */}
        <div className="flex-1">
          <label className="block mb-1">Year(s):</label>
          <Select<YearOption, true>
            isMulti
            options={availableYears.map(y => ({ value: y, label: y.toString() }))}
            value={selectedYears}
            onChange={setSelectedYears}
            placeholder="Select year(s)..."
          />
        </div>
        {/* Type Picker */}
        <div className="flex-1">
          <label className="block mb-1">MyType(s):</label>
          <Select<MyTypeOption, true>
            isMulti
            options={allMyTypes}
            value={selectedTypes}
            onChange={setSelectedTypes}
            placeholder="Select type(s)..."
            isDisabled={!data.length}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ height: 400 }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: { display: true, text: 'Monthly VAmt by MyType & Year' },
                legend: { position: 'bottom' },
              },
              scales: {
                x: { title: { display: true, text: 'Month' } },
                y: { beginAtZero: true, title: { display: true, text: 'VAmt' } },
              },
              onClick: (_evt, elems) => handleBarClick(elems),
              hover: { mode: 'nearest', intersect: true },
            }}
          />
        </div>
      )}
    </div>
  );
}


// 'use client';

// import React, { useEffect, useState, useMemo } from 'react';
// import Select, { MultiValue } from 'react-select';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// type RecordItem = {
//   MyType: string;
//   IMonth: number;
//   Amt: number;
//   YearId: number;
// };

// type YearOption = { value: number; label: string };
// type MyTypeOption = { value: string; label: string };

// interface AggregateChartProps {
//   availableYears: number[];
// }

// const AggregateChart: React.FC<AggregateChartProps> = ({ availableYears }) => {
//   const [selectedYears, setSelectedYears] = useState<MultiValue<YearOption>>(
//     availableYears.map((yr) => ({ value: yr, label: yr.toString() }))
//   );
//   const [selectedTypes, setSelectedTypes] = useState<MultiValue<MyTypeOption>>([]);
//   const [data, setData] = useState<RecordItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       const yearIds = selectedYears.map((opt) => opt.value).join(',');

//       try {
//         const res = await fetch(`/api/aggregate-transactions?yearIds=${yearIds}`);
//         const json = (await res.json()) as RecordItem[];
//         setData(json);
//       } catch (err) {
//         console.error('Failed to fetch:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (selectedYears.length > 0) {
//       fetchData();
//     } else {
//       setData([]);
//     }
//   }, [selectedYears]);

//   // Unique MyType options
//   const allMyTypes = useMemo(() => {
//     const types = Array.from(new Set(data.map((d) => d.MyType)));
//     return types.map((type) => ({ value: type, label: type }));
//   }, [data]);

//   // Prepare data for Chart.js
//   const chartData = useMemo(() => {
//     const filteredData = selectedTypes.length
//       ? data.filter((d) => selectedTypes.some((type) => type.value === d.MyType))
//       : data;

//     const types = Array.from(new Set(filteredData.map((d) => d.MyType)));
//     const monthLabels = Array.from({ length: 12 }, (_, i) =>
//       new Date(0, i).toLocaleString('default', { month: 'short' })
//     );

//     const colorPalette = [
//       '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
//       '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
//     ];

//     const datasets = types.flatMap((type, typeIndex) =>
//       selectedYears.map((opt, optIndex) => {
//         const year = opt.value;
//         const monthSums = monthLabels.map((_, idx) => {
//           const rec = filteredData.find(
//             (d) => d.MyType === type && d.YearId === year && d.IMonth === idx + 1
//           );
//           return rec ? rec.Amt : 0;
//         });

//         return {
//           label: `${type} (${year})`,
//           data: monthSums,
//           barThickness: 25,
//           backgroundColor: colorPalette[(typeIndex + optIndex) % colorPalette.length],
//         };
//       })
//     );

//     return {
//       labels: monthLabels,
//       datasets,
//     };
//   }, [data, selectedYears, selectedTypes]);

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-semibold mb-2">Compare VAmt by Month for Selected Years and Types</h2>

//     <div className='mb-4 p-4 flex flex-col md:flex-row gap-4 '>
//           {/* Year Multi-select */}
//       <div className="mb-4 flex-1">
//         <label className="block font-medium mb-1">Select Year(s):</label>
//         <Select<YearOption, true>
//           isMulti
      
//         options={availableYears.map((yr) => ({
//             value: yr,
//             label: yr.toString(),
//           }))}
//           value={selectedYears}
    
//         onChange={(opts) => {
//             console.log('Selected Years:', opts.map((opt) => opt.value)); // [2023, 2024, ...]
//             setSelectedYears(opts);
//           }}
//           placeholder="Select year(s)..."
//           getOptionLabel={(e) => e.label}
//           getOptionValue={(e) => e.value.toString()}
//         />
//       </div>

//       {/* MyType Multi-select */}
//       <div className="mb-4 flex-1">
//         <label className="block font-medium mb-1">Select MyType(s):</label>
//         <Select<MyTypeOption, true>
//           isMulti
//           options={allMyTypes}
//           value={selectedTypes}
//           onChange={(opts) => setSelectedTypes(opts)}
//           placeholder="Select MyType(s)..."
//           isDisabled={data.length === 0}
//           getOptionLabel={(e) => e.label}
//           getOptionValue={(e) => e.value}
//         />
//       </div>
//     </div>

//       {loading ? (
//         <p>Loading data...</p>
//       ) : (
//         <div style={{ height: 400 }}>
//           <Bar
//             data={chartData}
//             options={{
//               responsive: true,
//               maintainAspectRatio: false,
//               plugins: {
//                 title: {
//                   display: true,
//                   text: 'Monthly VAmt by MyType & Year',
//                 },
//                 legend: {
//                   position: 'bottom',
//                 },
//               },
//               scales: {
//                 x: {
//                   title: {
//                     display: true,
//                     text: 'Month',
//                   },
//                 },
//                 y: {
//                   beginAtZero: true,
//                   title: {
//                     display: true,
//                     text: 'VAmt',
//                   },
//                 },
//               },
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default AggregateChart;



