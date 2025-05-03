// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const fromDate = searchParams.get('fromDate');
//   const toDate = searchParams.get('toDate');

//   if (!fromDate || !toDate) {
//     return NextResponse.json(
//       { error: 'Both fromDate and toDate query parameters are required.' },
//       { status: 400 }
//     );
//   }

//   try {
//     const connectionPool = await webpPool;
//     const queryText = `
//       SELECT YearId, MyType
//       FROM DailyTransImport
//       WHERE UsrDate BETWEEN @fromDate AND @toDate
//     `;
    
//     const result = await connectionPool
//       .request()
//       .input('fromDate', new Date(fromDate))
//       .input('toDate', new Date(toDate))
//       .query(queryText);

//     // Log the entire result for debugging
//     console.log('Database query result:', result);
    
//     return NextResponse.json(result.recordset);
//   } catch (error: any) {
//     console.error('Database query error:', error);
//     return NextResponse.json(
//       { error: error.message || 'Internal server error.' },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from 'next/server';
import webpPool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { error: 'Both fromDate and toDate query parameters are required.' },
      { status: 400 }
    );
  }

  try {
    const connectionPool = await webpPool;
    
    const queryText = `
      SELECT 
        MyType,
        COUNT(*) AS Nos,
        SUM(VAmt) AS Net
      FROM DailyTransImport
      WHERE UsrDate BETWEEN @fromDate AND @toDate
      GROUP BY MyType
    `;

    const result = await connectionPool
      .request()
      .input('fromDate', new Date(fromDate))
      .input('toDate', new Date(toDate))
      .query(queryText);

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
