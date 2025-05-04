'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const yearIdParam = req.nextUrl.searchParams.get('yearId');

  if (!yearIdParam) {
    return NextResponse.json({ error: 'Missing yearId' }, { status: 400 });
  }
  const yearId = Number(yearIdParam);
  if (Number.isNaN(yearId)) {
    return NextResponse.json({ error: 'Invalid yearId' }, { status: 400 });
  }

  // 1. Verify JWT cookie
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

  // 2. Run query, binding both yearId and companyCode
  try {
    const pool = await db;
    const request = pool.request()
      .input('yearId', yearId)
      .input('companyCode', payload.companyCode);

    const result = await request.query(`
      SELECT
        (SELECT TOP 1 UsrDate
         FROM DailyTransImport
         WHERE YearId = @yearId
           AND companyCode = @companyCode
         ORDER BY UsrDate ASC
        ) AS FromDate,
        (SELECT TOP 1 UsrDate
         FROM DailyTransImport
         WHERE YearId = @yearId
           AND companyCode = @companyCode
         ORDER BY UsrDate DESC
        ) AS ToDate
    `);

    // If no rows found, return empty object or nulls
    const row = result.recordset[0] || { FromDate: null, ToDate: null };
    return NextResponse.json(row);
  } catch (err: any) {
    console.error('[YEARID_DATE_RANGE_ERROR]', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}




// import { NextRequest, NextResponse } from 'next/server';
// import db from '@/lib/db';
// import { jwtVerify } from 'jose';

// export async function GET(req: NextRequest) {
//   const JWT_SECRET = process.env.JWT_SECRET!;
//   const yearId = req.nextUrl.searchParams.get('yearId');

//   if (!yearId) {
//     return NextResponse.json({ error: 'Missing yearId' }, { status: 400 });
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

//     const pool = await db; // Resolve db connection
//     const request = pool.request();
//     request.input('yearId', Number(yearId));

//     const result = await request.query(`
//       SELECT 
//         (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId AND companyCode = @companyCode ORDER BY UsrDate ASC) AS FromDate,
//         (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId AND companyCode = @companyCode ORDER BY UsrDate DESC) AS ToDate
//     `);

//     return NextResponse.json(result.recordset?.[0] || {});
//   } catch (error) {
//     console.error('Error fetching date range for yearId:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
