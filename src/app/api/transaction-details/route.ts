import { NextResponse } from 'next/server';
import webpPool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const myType    = searchParams.get('myType');
  const rawParty  = searchParams.get('party');
  const partyCode = rawParty ? decodeURIComponent(rawParty) : null;
  const fromDate  = searchParams.get('fromDate');
  const toDate    = searchParams.get('toDate');

  // required params: myType, fromDate, toDate
  if (!myType || !fromDate || !toDate) {
    return NextResponse.json(
      { error: 'myType, fromDate, and toDate query parameters are required.' },
      { status: 400 }
    );
  }

  try {
    const pool = await webpPool;
    // build WHERE clauses dynamically
    const whereClauses: string[] = ['MyType = @myType', 'UsrDate BETWEEN @fromDate AND @toDate'];
    // if (partyCode) {
    //   whereClauses.push('PartyCode = @partyCode');
    // }
    const sqlQuery = `
      SELECT *
      FROM DailyTransImport
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY UsrDate ASC
    `;

    const requestBuilder = pool.request()
      .input('myType', myType)
      .input('fromDate', new Date(fromDate))
      .input('toDate',   new Date(toDate));

    // if (partyCode) {
    //   requestBuilder.input('partyCode', partyCode);
    // }

    const result = await requestBuilder.query(sqlQuery);

    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('Error fetching transaction details:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}




// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const myType    = searchParams.get('myType');
//   const partyCode = searchParams.get('party');
//   const fromDate  = searchParams.get('fromDate');
//   const toDate    = searchParams.get('toDate');

//   // all four params are now required
//   if (!myType || !partyCode || !fromDate || !toDate) {
//     return NextResponse.json(
//       { error: 'myType, party, fromDate, and toDate query parameters are required.' },
//       { status: 400 }
//     );
//   }

//   try {
//     const pool = await webpPool;
//     const queryText = `
      // SELECT *
      // FROM DailyTransImport
      // WHERE MyType    = @myType
      //   AND PartyCode = @partyCode
      //   AND UsrDate  BETWEEN @fromDate AND @toDate
      // ORDER BY UsrDate ASC
//     `;
//     const result = await pool
//       .request()
//       .input('myType', myType)
//       .input('partyCode', partyCode)
//       .input('fromDate', new Date(fromDate))
//       .input('toDate',   new Date(toDate))
//       .query(queryText);

//     return NextResponse.json(result.recordset);
//   } catch (error: any) {
//     console.error('Error fetching transaction details:', error);
//     return NextResponse.json(
//       { error: error.message || 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const myType = searchParams.get('myType');
//   const fromDate = searchParams.get('fromDate');
//   const toDate = searchParams.get('toDate');

//   if (!myType || !fromDate || !toDate) {
//     return NextResponse.json(
//       { error: 'myType, fromDate, and toDate query parameters are required.' },
//       { status: 400 }
//     );
//   }

//   try {
//     const pool = await webpPool;
//     const queryText = `
//       SELECT *
//       FROM DailyTransImport
//       WHERE MyType = @myType
//         AND UsrDate BETWEEN @fromDate AND @toDate
//       ORDER BY UsrDate ASC
//     `;
//     const result = await pool
//       .request()
//       .input('myType', myType)
//       .input('fromDate', new Date(fromDate))
//       .input('toDate', new Date(toDate))
//       .query(queryText);
      
//     return NextResponse.json(result.recordset);
//   } catch (error: any) {
//     console.error('Error fetching transaction details:', error);
//     return NextResponse.json(
//       { error: error.message || 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }
