// // Backend: app/api/transactions/route.ts
// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';

// export async function GET(request: Request) {
//   const url = new URL(request.url);
//   const fromDate = url.searchParams.get('fromDate');
//   const toDate = url.searchParams.get('toDate');
//   const yearId = url.searchParams.get('yearId');

//   // Validate required parameters
//   if (!fromDate || !toDate || !yearId) {
//     return NextResponse.json(
//       { error: 'fromDate, toDate, and yearId are required.' },
//       { status: 400 }
//     );
//   }
//   const year = parseInt(yearId, 10);
//   if (isNaN(year)) {
//     return NextResponse.json(
//       { error: 'yearId must be a valid integer.' },
//       { status: 400 }
//     );
//   }

//   try {
//     const pool = await webpPool;
//     const query = `
//       SELECT
//         UsrName,
//         UsrDate,
//         MyType,
//         COUNT(*) AS Nos,
//         SUM(VAmt) AS Amt
//       FROM DailyTransImport
//       WHERE UsrDate BETWEEN @fromDate AND @toDate
//         AND YearId = @yearId
//       GROUP BY UsrDate, MyType, UsrName
//       ORDER BY UsrDate, MyType, UsrName
//     `;

//     // Execute aggregation query
//     const result = await pool
//       .request()
//       .input('fromDate', new Date(fromDate))
//       .input('toDate', new Date(toDate))
//       .input('yearId', year)
//       .query(query);

//     // Expand each aggregated row into individual rows by its Nos count
//     const aggregated = result.recordset as Array<{ UsrName: string; UsrDate: string; MyType: string; Nos: number; Amt: number }>;
//     const expanded = aggregated.flatMap(r =>
//       Array.from({ length: r.Nos }, () => ({
//         UsrName: r.UsrName,
//         UsrDate: r.UsrDate,
//         MyType: r.MyType,
//         Nos: 1,
//         Amt: r.Amt,
//       }))
//     );

//     return NextResponse.json(expanded);
//   } catch (err: any) {
//     console.error('Database query error:', err);
//     return NextResponse.json(
//       { error: err.message || 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// Frontend remains unchanged; the component will now receive expanded rows directly.  




import { NextResponse } from 'next/server';
import webpPool from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fromDate = url.searchParams.get('fromDate');
  const toDate = url.searchParams.get('toDate');
  const yearId = url.searchParams.get('yearId');

  // Validate required parameters
  if (!fromDate || !toDate || !yearId) {
    return NextResponse.json(
      { error: 'fromDate, toDate, and yearId are required.' },
      { status: 400 }
    );
  }
  const year = parseInt(yearId, 10);
  if (isNaN(year)) {
    return NextResponse.json(
      { error: 'yearId must be a valid integer.' },
      { status: 400 }
    );
  }

  try {
    const pool = await webpPool;
    const query = `
      SELECT
        UsrName,
        UsrDate,
        MyType,
        COUNT(*) AS Nos,
        SUM(VAmt) AS Amt
      FROM DailyTransImport
      WHERE UsrDate BETWEEN @fromDate AND @toDate
        AND YearId = @yearId
      GROUP BY UsrDate, MyType, UsrName
      ORDER BY UsrDate, MyType, UsrName
    `;

    const result = await pool
      .request()
      .input('fromDate', new Date(fromDate))
      .input('toDate', new Date(toDate))
      .input('yearId', year)  
      .query(query);

    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('Database query error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}