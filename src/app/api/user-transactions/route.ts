'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;

  // 1. Extract & validate query params
  const url = new URL(req.url);
  const fromDate = url.searchParams.get('fromDate');
  const toDate   = url.searchParams.get('toDate');
  const yearId   = url.searchParams.get('yearId');

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

  // 2. Authenticate and decode JWT
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

  console.log('Decoded JWT Payload:', payload);

  // 3. Run the DB query, binding companyCode
  try {
    const pool = await webpPool;
    const request = pool.request()
      .input('fromDate', new Date(fromDate))
      .input('toDate',   new Date(toDate))
      .input('yearId',   year)
      .input('companyCode', payload.companyCode);   // ⚠️ bind the companyCode!

    const result = await request.query(`
      SELECT
        UsrName,
        UsrDate,
        MyType,
        COUNT(*) AS Nos,
        SUM(VAmt) AS Amt
      FROM DailyTransImport
      WHERE UsrDate BETWEEN @fromDate AND @toDate
        AND YearId     = @yearId
        AND companyCode= @companyCode
      GROUP BY UsrDate, MyType, UsrName
      ORDER BY UsrDate, MyType, UsrName
    `);

    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[DATA_FETCH_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';
// import { jwtVerify } from 'jose';

// export async function GET(request: Request) {
//   const JWT_SECRET = process.env.JWT_SECRET!;
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
//         AND companyCode = @companyCode
//       GROUP BY UsrDate, MyType, UsrName
//       ORDER BY UsrDate, MyType, UsrName
//     `;

//     const result = await pool
//       .request()
//       .input('fromDate', new Date(fromDate))
//       .input('toDate', new Date(toDate))
//       .input('yearId', year)  
//       .query(query);

//     return NextResponse.json(result.recordset);
//   } catch (err: any) {
//     console.error('Database query error:', err);
//     return NextResponse.json(
//       { error: err.message || 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }