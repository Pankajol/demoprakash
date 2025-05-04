
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import sql from 'mssql';
import webpPool from '@/lib/db';

/**
 * GET /api/aggregate-transactions
 * Query params:
 *   - yearIds (comma-separated list of integers)
 * Secured: requires valid JWT in HTTP-only 'token' cookie; filters by companyCode
 */
export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Validate yearIds param
  const yearIdsParam = searchParams.get('yearIds');
  if (!yearIdsParam) {
    return NextResponse.json({ error: 'yearIds is required.' }, { status: 400 });
  }
  const yearIds = yearIdsParam.split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
  if (!yearIds.length) {
    return NextResponse.json({ error: 'yearIds must contain valid integers.' }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Build parameter placeholders and bind inputs
  const placeholders = yearIds.map((_, i) => `@id${i}`).join(',');
  const pool = await webpPool;
  const request = pool.request()
    .input('companyCode', payload.companyCode);

  yearIds.forEach((id, i) => {
    request.input(`id${i}`, sql.Int, id);
  });

  // 4. Execute aggregated query with company filter
  const sqlQuery = `
    SELECT
      MyType,
      MONTH(UsrDate) AS IMonth,
      SUM(VAmt)      AS Amt,
      YearId
    FROM dbo.DailyTransImport
    WHERE YearId IN (${placeholders})
      AND companyCode = @companyCode
    GROUP BY MONTH(UsrDate), MyType, YearId
    ORDER BY MyType, MONTH(UsrDate), YearId;
  `;

  try {
    const result = await request.query(sqlQuery);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[AGGREGATE_TRANSACTIONS_ERROR]', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}




// // app/api/aggregate-transactions/route.ts
// import { NextResponse } from 'next/server';
// import sql from 'mssql';
// import webpPool from '@/lib/db';    // your WebpPlus pool

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const yearIdsParam = searchParams.get('yearIds');
//   if (!yearIdsParam) {
//     return NextResponse.json({ error: 'yearIds is required.' }, { status: 400 });
//   }

//   // Parse and prepare parameter placeholders
//   const yearIds = yearIdsParam.split(',').map((s) => parseInt(s, 10));
//   const placeholders = yearIds.map((_, i) => `@id${i}`).join(',');
  
//   try {
//     // Bind parameters
//     const req = (await webpPool).request();
//     yearIds.forEach((id, i) => req.input(`id${i}`, sql.Int, id));

//     // Run the aggregation query
//     const result = await req.query(`
//       SELECT
//         MyType,
//         MONTH(UsrDate)    AS IMonth,
//         SUM(VAmt)         AS Amt,
//         YearId
//       FROM dbo.DailyTransImport
//       WHERE YearId IN (${placeholders})
//       GROUP BY MONTH(UsrDate), MyType, YearId
//       ORDER BY MyType, MONTH(UsrDate), YearId
//     `);
    
//     return NextResponse.json(result.recordset);
//   } catch (err: any) {
//     console.error('API error:', err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
