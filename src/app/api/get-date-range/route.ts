'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const yearIdParam = req.nextUrl.searchParams.get('yearId');

  if (!yearIdParam) {
    return NextResponse.json({ error: 'yearId is required.' }, { status: 400 });
  }
  const yearId = parseInt(yearIdParam, 10);
  if (Number.isNaN(yearId)) {
    return NextResponse.json({ error: 'yearId must be a number.' }, { status: 400 });
  }

  // 1. Authenticate via HTTP-only cookie
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

  // 2. Query for start/end dates scoped to companyCode
  try {
    const pool = await webpPool;
    const result = await pool.request()
      .input('yearId', yearId)
      .input('companyCode', payload.companyCode)
      .query(`
        SELECT 
          (SELECT TOP 1 UsrDate
           FROM dbo.DailyTransImport
           WHERE YearId = @yearId
             AND companyCode = @companyCode
           ORDER BY UsrDate ASC
          ) AS StartDate,
          (SELECT TOP 1 UsrDate
           FROM dbo.DailyTransImport
           WHERE YearId = @yearId
             AND companyCode = @companyCode
           ORDER BY UsrDate DESC
          ) AS EndDate
      `);

    // If no records found, this will return { StartDate: null, EndDate: null }
    return NextResponse.json(result.recordset[0]);
  } catch (error: any) {
    console.error('[YEAR_RANGE_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}



// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const yearId = searchParams.get('yearId');

//   if (!yearId) {
//     return NextResponse.json({ error: 'yearId is required.' }, { status: 400 });
//   }

//   try {
//     const connectionPool = await webpPool;

//     // Get the start date (earliest UsrDate) and end date (latest UsrDate) for the given year
//     const result = await connectionPool
//       .request()
//       .input('yearId', parseInt(yearId))
//       .query(`
//         SELECT 
//           (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId ORDER BY UsrDate ASC) AS StartDate,
//           (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId ORDER BY UsrDate DESC) AS EndDate
//       `);

//     return NextResponse.json(result.recordset[0]);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
