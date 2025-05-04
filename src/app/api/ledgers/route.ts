
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Validate required query params
  const partyCodeParam = searchParams.get('partyCode');
  const fromDateParam  = searchParams.get('fromDate');
  const toDateParam    = searchParams.get('toDate');
  const yearIdParam    = searchParams.get('yearId');
  const partyParam     = searchParams.get('party');

  if (!partyCodeParam || !fromDateParam || !toDateParam || !yearIdParam) {
    return NextResponse.json(
      { error: 'Missing required parameters: partyCode, fromDate, toDate, and yearId are required.' },
      { status: 400 }
    );
  }

  const fromDate = new Date(fromDateParam);
  const toDate   = new Date(toDateParam);
  const yearId   = parseInt(yearIdParam, 10);
  const party    = partyParam ? decodeURIComponent(partyParam) : null;

  if (isNaN(yearId)) {
    return NextResponse.json({ error: 'yearId must be a valid integer.' }, { status: 400 });
  }

  // 2. Authenticate via JWT cookie
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let payload: any;
  try {
    ({ payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    ));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Build and execute query
  try {
    const pool = await webpPool;
    const request = pool.request()
      .input('fromDate',  fromDate)
      .input('toDate',    toDate)
      .input('partyCode', decodeURIComponent(partyCodeParam))
      .input('yearId',    yearId)
      .input('companyCode', payload.companyCode);

    if (party) {
      request.input('party', party);
    }

    const sqlQuery = `
      SELECT
        AA.Mytype,
        AA.VNo,
        AA.UsrDate,
        AA.PartyCode,
        AA.Party   AS Type,
        AA.DrTypeId,
        AA.TradingLed AS Ledger,
        CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt ELSE 0 END AS DrAmt,
        CASE WHEN AA.DrTypeId = 0 THEN AA.VAmt ELSE 0 END AS CrAmt,
        SUM(CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt ELSE -AA.VAmt END)
          OVER (ORDER BY AA.UsrDate, AA.VNo ROWS UNBOUNDED PRECEDING) AS Bal,
        AA.YearId
      FROM dbo.DailyTransImport AA
      WHERE AA.UsrDate BETWEEN @fromDate AND @toDate
        AND AA.PartyCode = @partyCode
        ${party ? 'AND AA.Party = @party' : ''}
        AND AA.companyCode = @companyCode
        AND AA.YearId = @yearId
      ORDER BY AA.UsrDate, AA.VNo;
    `;

    const result = await request.query(sqlQuery);
    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('[OUTSTANDING_TRANSACTIONS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}





// import { NextRequest, NextResponse } from 'next/server';
// import sql from 'mssql';
// import webpPool from '@/lib/db';

// // Named export for the GET request
// export async function GET(req: NextRequest) {
//   const { searchParams } = req.nextUrl;
//   const partyCode = searchParams.get('partyCode');
//   const party = searchParams.get('party');
//   const fromDate = searchParams.get('fromDate');
//   const toDate = searchParams.get('toDate');
//   const yearId = searchParams.get('yearId');

//   // Validate query parameters
//   if (!partyCode || !fromDate || !toDate || !yearId) {
//     return NextResponse.json(
//       { message: 'Missing required parameters: partyCode, fromDate, toDate, and yearId are required.' },
//       { status: 400 }
//     );
//   }

//   try {
//     // Construct the SQL query with parameter placeholders
//     const sqlQuery = `
//       SELECT
//         AA.Mytype,
//         AA.VNo,
//         AA.UsrDate,
//         AA.PartyCode,
//         AA.Party AS Type,
//         AA.DrTypeId,
//         AA.TradingLed AS Ledger,
//         CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt ELSE 0 END AS DrAmt,
//         CASE WHEN AA.DrTypeId = 0 THEN AA.VAmt ELSE 0 END AS CrAmt,
//         SUM(CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt ELSE -AA.VAmt END) OVER (ORDER BY AA.UsrDate, AA.VNo ROWS UNBOUNDED PRECEDING) AS Bal,
//         AA.YearId
//       FROM DailyTransImport AA
//       WHERE AA.UsrDate BETWEEN @fromDate AND @toDate
//         AND AA.PartyCode = @partyCode
//         ${party ? 'AND AA.Party = @party' : ''}
//         AND AA.WebpCompanyId = 'comp0001'
//         AND AA.YearId = @yearId
//       ORDER BY AA.UsrDate, AA.VNo;
//     `;

//     // Fetch data from the database
//     const result = await queryDatabase(
//       sqlQuery,
//       { fromDate, toDate, partyCode, yearId, party }
//     );

//     // Return the result as JSON
//     return NextResponse.json(result.recordset);

//   } catch (error) {
//     console.error('Error fetching data:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to query the database
// async function queryDatabase(
//   query: string,
//   params: { fromDate: string; toDate: string; partyCode: string; yearId: string; party?: string }
// ) {
//   const pool = await webpPool;
//   const request = pool.request();

//   request.input('fromDate', sql.Date, params.fromDate);
//   request.input('toDate', sql.Date, params.toDate);
//   request.input('partyCode', sql.NVarChar, decodeURIComponent(params.partyCode));
//   request.input('yearId', sql.Int, parseInt(params.yearId, 10));
//   if (params.party) {
//     request.input('party', sql.NVarChar, decodeURIComponent(params.party));
//   }

//   return await request.query(query);
// }






// import { NextRequest, NextResponse } from 'next/server';
// import sql from 'mssql';
// import webpPool from '@/lib/db';

// // Named export for the GET request
// export async function GET(req: NextRequest) {
//   const { searchParams } = req.nextUrl;
//   const partyCode = searchParams.get('partyCode');
//   // const party = searchParams.get('partyName');
//   const fromDate = searchParams.get('fromDate');
//   const toDate = searchParams.get('toDate');
//   const yearId = searchParams.get('yearId'); // Adding yearId as part of the query parameters

//   // Validate query parameters
//   if (!partyCode || !fromDate || !toDate || !yearId ) {
//     return NextResponse.json(
//       { message: 'Missing required parameters: partyCode, fromDate, toDate, and yearId are required.' },
//       { status: 400 }
//     );
//   }

//   try {
//     // Construct the SQL query with parameter placeholders
//     const sqlQuery = `
//       SELECT
//         AA.Mytype,
//         AA.VNo,
//         AA.UsrDate,
//         AA.PartyCode,
//         AA.Party AS Type,
//         AA.DrTypeId,
//         AA.TradingLed AS Ledger,
//         CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt ELSE 0 END AS DrAmt,
//         CASE WHEN AA.DrTypeId = 0 THEN AA.VAmt ELSE 0 END AS CrAmt,
//         -- Running balance: cumulative sum of debits minus credits
//         SUM(
//           CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt
//                ELSE -AA.VAmt
//           END
//         ) OVER (
//           ORDER BY AA.UsrDate, AA.VNo
//           ROWS UNBOUNDED PRECEDING
//         ) AS Bal,
//         AA.YearId
//       FROM DailyTransImport AA
//       WHERE AA.UsrDate BETWEEN @fromDate AND @toDate
//         AND AA.PartyCode = @partyCode
//         AND AA.Party = @party
//         AND AA.WebpCompanyId = 'comp0001'
//         AND AA.YearId = @yearId
//       ORDER BY AA.UsrDate, AA.VNo;
//     `;

//     // Fetch data from the database using the queryDatabase helper function
//     const result = await queryDatabase(sqlQuery, { fromDate, toDate, partyCode, yearId });

//     // Return the result as JSON
//     return NextResponse.json(result.recordset);

//   } catch (error) {
//     console.error('Error fetching data:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to query the database
// async function queryDatabase(query: string, params: { fromDate: string, toDate: string, partyCode: string,  yearId: string }) {
//   const pool = await webpPool; // Assuming webpPool is your DB connection pool
//   const request = pool.request();

//   // Add parameters to the request object
//   request.input('fromDate', sql.Date, params.fromDate);
//   request.input('toDate', sql.Date, params.toDate);
//   const decodedParty = decodeURIComponent(params.partyCode);
//   request.input('partyCode', sql.NVarChar, decodedParty);
//   // request.input('partyCode', sql.NVarChar, params.partyCode);
//   // request.input('party', sql.NVarChar, `%${params.party}%`); // Add party parameter
//   request.input('yearId', sql.Int, params.yearId); // Add yearId parameter

//   // Execute the query and return the result
//   return await request.query(query);
// }
