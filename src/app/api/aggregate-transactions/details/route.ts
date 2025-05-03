// app/api/aggregate-transactions/details/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import webpPool from '@/lib/db'; // your WebpPlus pool

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  if (!typeParam || !yearParam || !monthParam) {
    return NextResponse.json(
      { error: 'Query parameters `type`, `year`, and `month` are required.' },
      { status: 400 }
    );
  }

  const yearId = parseInt(yearParam, 10);
  const monthNum = parseInt(monthParam, 10);
  if (isNaN(yearId) || isNaN(monthNum)) {
    return NextResponse.json(
      { error: '`year` and `month` must be valid numbers.' },
      { status: 400 }
    );
  }

  try {
    const pool = await webpPool;
    const req = pool.request();
    req.input('typeParam', sql.VarChar, typeParam);
    req.input('yearId', sql.Int, yearId);
    req.input('month', sql.Int, monthNum);

    const query = `
      SELECT
        MyType,
        MONTH(UsrDate) AS IMonth,
        SUM(VAmt)      AS Amt,
        YearId,
        VNo,
        PartyCode,
        UsrDate,
        Party as type,
        VAmt,
        AdjAmt
      FROM dbo.DailyTransImport
      WHERE MyType = @typeParam
        AND YearId = @yearId
        AND MONTH(UsrDate) = @month
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

    const result = await req.query(query);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('Details API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



// app/api/aggregate-transactions/details/route.ts
// import { NextResponse } from 'next/server';
// import sql from 'mssql';
// import webpPool from '@/lib/db'; // your WebpPlus pool

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const type = searchParams.get('type');
//   const yearParam = searchParams.get('year');
//   const monthParam = searchParams.get('month');

//   if (!type || !yearParam || !monthParam) {
//     return NextResponse.json({ error: 'type, year and month are required.' }, { status: 400 });
//   }

//   const yearId = parseInt(yearParam, 10);
//   const monthNum = parseInt(monthParam, 10);

//   if (isNaN(yearId) || isNaN(monthNum)) {
//     return NextResponse.json({ error: 'year and month must be valid numbers.' }, { status: 400 });
//   }

//   try {
//     const req = (await webpPool).request();
//     req.input('type', sql.VarChar, type);
//     req.input('yearId', sql.Int, yearId);
//     req.input('month', sql.Int, monthNum);

//     const result = await req.query(`
//       SELECT
//         MyType,
//         MONTH(UsrDate) AS IMonth,
//         SUM(VAmt)      AS Amt,
//         YearId,
// 		PartyCode,
// 		Party as type,
// 		VAmt,
// 		AdjAmt
//       FROM dbo.DailyTransImport
//       WHERE MyType = @type
//         AND YearId = @yearId
//         AND MONTH(UsrDate) = @month
//       GROUP BY MONTH(UsrDate),  MyType, YearId,PartyCode,Party,VAmt,AdjAmt
//       ORDER BY MyType, MONTH(UsrDate), YearId
//     `);

//     return NextResponse.json(result.recordset);
//   } catch (err: any) {
//     console.error('Details API error:', err);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
