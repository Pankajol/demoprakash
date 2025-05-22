'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import sql from 'mssql';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Validate query parameters
  const typeParam   = searchParams.get('type');
  const yearParam   = searchParams.get('year');
  const monthParam  = searchParams.get('month');
  if (!typeParam || !yearParam || !monthParam) {
    return NextResponse.json(
      { error: 'Query parameters `type`, `year`, and `month` are required.' },
      { status: 400 }
    );
  }
  const yearId   = parseInt(yearParam,  10);
  const monthNum = parseInt(monthParam, 10);
  if (isNaN(yearId) || isNaN(monthNum)) {
    return NextResponse.json(
      { error: '`year` and `month` must be valid numbers.' },
      { status: 400 }
    );
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

  // 3. Build and execute DB query
  try {
    const pool = await webpPool;
    const request = pool.request()
      // supply a VarChar with a length, and Int for numbers:
      .input('typeParam',   sql.VarChar(50), typeParam)
      .input('yearId',      sql.Int,         yearId)
      .input('month',       sql.Int,         monthNum)
      .input('companyCode', sql.VarChar(20), payload.companyCode);

    const sqlQuery = `
      SELECT
        MyType,
        MONTH(UsrDate)    AS IMonth,
        SUM(VAmt)         AS Amt,
        YearId,
        VNo,
        PartyCode,
        UsrDate,
        Party             AS type,
        VAmt,
        AdjAmt
      FROM dbo.DailyTransImport
      WHERE MyType        = @typeParam
        AND YearId        = @yearId
        AND MONTH(UsrDate)= @month
        AND companyCode   = @companyCode
      GROUP BY
        MONTH(UsrDate),
        MyType,
        VNo,
        YearId,
        PartyCode,
        UsrDate,
        Party,
        VAmt,
        AdjAmt
      ORDER BY MyType, MONTH(UsrDate);
    `;

    const result = await request.query(sqlQuery);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[AGGREGATE_DETAILS_ERROR]', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}




// 'use server';

// import { NextRequest, NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';
// import sql from 'mssql';
// import webpPool from '@/lib/db';

// /**
//  * GET /api/aggregate-transactions/details
//  * Query params: type, year, month
//  * Secured: requires valid JWT cookie; filters by companyCode
//  */
// export async function GET(req: NextRequest) {
//   const JWT_SECRET = process.env.JWT_SECRET!;
//   const { searchParams } = new URL(req.url);

//   // 1. Validate query parameters
//   const typeParam = searchParams.get('type');
//   const yearParam = searchParams.get('year');
//   const monthParam = searchParams.get('month');

//   if (!typeParam || !yearParam || !monthParam) {
//     return NextResponse.json(
//       { error: 'Query parameters `type`, `year`, and `month` are required.' },
//       { status: 400 }
//     );
//   }

//   const yearId = parseInt(yearParam, 10);
//   const monthNum = parseInt(monthParam, 10);
//   if (isNaN(yearId) || isNaN(monthNum)) {
//     return NextResponse.json(
//       { error: '`year` and `month` must be valid numbers.' },
//       { status: 400 }
//     );
//   }

//   // 2. Authenticate via JWT cookie
//   const token = req.cookies.get('token')?.value;
//   if (!token) {
//     return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//   }

//   let payload: any;
//   try {
//     ({ payload } = await jwtVerify(
//       token,
//       new TextEncoder().encode(JWT_SECRET)
//     ));
//   } catch (err) {
//     return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
//   }

//   // 3. Build and execute DB query
//   try {
//     const pool = await webpPool;
//     const request = pool.request()
//       .input('typeParam', sql.VarChar, typeParam)
//       .input('yearId', sql.Int, yearId)
//       .input('month', sql.Int, monthNum)
//       .input('companyCode', payload.companyCode);

//     const sqlQuery = `
//       SELECT
//         MyType,
//         MONTH(UsrDate) AS IMonth,
//         SUM(VAmt)      AS Amt,
//         YearId,
//         VNo,
//         PartyCode,
//         UsrDate,
//         Party         AS type,
//         VAmt,
//         AdjAmt
//       FROM dbo.DailyTransImport
//       WHERE MyType      = @typeParam
//         AND YearId      = @yearId
//         AND MONTH(UsrDate) = @month
//         AND companyCode = @companyCode
//       GROUP BY
//         MONTH(UsrDate),
//         MyType,
//         VNo,
//         YearId,
//         PartyCode,
//         UsrDate,
//         Party,
//         VAmt,
//         AdjAmt
//       ORDER BY MyType, MONTH(UsrDate);
//     `;

//     const result = await request.query(sqlQuery);
//     return NextResponse.json(result.recordset);
//   } catch (err: any) {
//     console.error('[AGGREGATE_DETAILS_ERROR]', err);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


