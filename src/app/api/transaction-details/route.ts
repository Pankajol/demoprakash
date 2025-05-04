'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Extract & validate query params
  const myType   = searchParams.get('myType');
  const rawParty = searchParams.get('party');
  const partyCode = rawParty ? decodeURIComponent(rawParty) : null;
  const fromDate = searchParams.get('fromDate');
  const toDate   = searchParams.get('toDate');

  if (!myType || !fromDate || !toDate) {
    return NextResponse.json(
      { error: 'myType, fromDate, and toDate are required.' },
      { status: 400 }
    );
  }

  // 2. Authenticate & decode JWT
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
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Build dynamic WHERE clause
  const where: string[] = [
    'MyType = @myType',
    'UsrDate BETWEEN @fromDate AND @toDate',
    'companyCode = @companyCode'
  ];
  if (partyCode) {
    where.push('PartyCode = @partyCode');
  }

  const sql = `
    SELECT *
    FROM DailyTransImport
    WHERE ${where.join(' AND ')}
    ORDER BY UsrDate ASC
  `;

  // 4. Bind inputs and execute
  try {
    const pool = await webpPool;
    const reqB = pool.request()
      .input('myType',   myType)
      .input('fromDate', new Date(fromDate))
      .input('toDate',   new Date(toDate))
      .input('companyCode', payload.companyCode);

    if (partyCode) {
      reqB.input('partyCode', partyCode);
    }

    const result = await reqB.query(sql);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[TRANSACTIONS_FETCH_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}




// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';
// import { jwtVerify } from 'jose';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const JWT_SECRET = process.env.JWT_SECRET!;
//   const myType    = searchParams.get('myType');
//   const rawParty  = searchParams.get('party');
//   const partyCode = rawParty ? decodeURIComponent(rawParty) : null;
//   const fromDate  = searchParams.get('fromDate');
//   const toDate    = searchParams.get('toDate');

//   // required params: myType, fromDate, toDate
//   if (!myType || !fromDate || !toDate) {
//     return NextResponse.json(
//       { error: 'myType, fromDate, and toDate query parameters are required.' },
//       { status: 400 }
//     );
//   }

//   try {
//     const token = req.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//     }

//     let payload: any;
//     try {
//       const { payload: userPayload } = await jwtVerify(
//         token,
//         new TextEncoder().encode(JWT_SECRET)
//       );
//       payload = userPayload;
//       console.log("Decoded JWT Payload:", payload);
//     } catch (_e) {
//       return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
//     }

//     const pool = await webpPool;
//     // build WHERE clauses dynamically
//     const whereClauses: string[] = ['MyType = @myType', 'UsrDate BETWEEN @fromDate AND @toDate'];
//     // if (partyCode) {
//     //   whereClauses.push('PartyCode = @partyCode');
//     // }
//     const sqlQuery = `
//       SELECT *
//       FROM DailyTransImport
//       WHERE ${whereClauses.join(' AND ')}
//       AND companyCode = @companyCode
//       ORDER BY UsrDate ASC
//     `;

//     const requestBuilder = pool.request()
//       .input('myType', myType)
//       .input('fromDate', new Date(fromDate))
//       .input('toDate',   new Date(toDate));

//     // if (partyCode) {
//     //   requestBuilder.input('partyCode', partyCode);
//     // }

//     const result = await requestBuilder.query(sqlQuery);

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
