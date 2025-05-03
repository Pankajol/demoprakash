'use client';

import React, { useEffect, useState } from "react";
import AggregateChart from "@/components/AggregateChart";

export default function HomePage() {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loadingYears, setLoadingYears] = useState(true);


  useEffect(() => {
    const loadYears = async () => {
      try {
        const response = await fetch('/api/yearIds');
        const data = await response.json();
        console.log("YearId API response:", data);
        const yearsList = data.map((item: { YearId: number }) => item.YearId);
        setAvailableYears(yearsList);
        // if (yearsList.length > 0) setSelectedYear(yearsList[0]);
      } catch (error) {
        console.error("Error fetching years:", error);
      } finally {
        setLoadingYears(false);
      }
    };
    loadYears();
  }, []);

  

//   useEffect(() => {
//     async function loadYears() {
//       try {
//         const res = await fetch("/api/yearIds");
//         const years = (await res.json()) as number[];
//         setAvailableYears(years);
//       } catch (error) {
//         console.error("Failed to load years:", error);
//       } finally {
//         setLoadingYears(false);
//       }
//     }
//     loadYears();
//   }, []);


  console.log("Available Years:", availableYears);

  if (loadingYears) {
    return <p>Loading years…</p>;
  }

  return (
    <main>
      <h1>DailyTransImport Dashboard</h1>
      <AggregateChart availableYears={availableYears} />
    </main>
  );
}
