// app/api/aggregate-transactions/route.ts
import { NextResponse } from 'next/server';
import sql from 'mssql';
import webpPool from '@/lib/db';    // your WebpPlus pool

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearIdsParam = searchParams.get('yearIds');
  if (!yearIdsParam) {
    return NextResponse.json({ error: 'yearIds is required.' }, { status: 400 });
  }

  // Parse and prepare parameter placeholders
  const yearIds = yearIdsParam.split(',').map((s) => parseInt(s, 10));
  const placeholders = yearIds.map((_, i) => `@id${i}`).join(',');
  
  try {
    // Bind parameters
    const req = (await webpPool).request();
    yearIds.forEach((id, i) => req.input(`id${i}`, sql.Int, id));

    // Run the aggregation query
    const result = await req.query(`
      SELECT
        MyType,
        MONTH(UsrDate)    AS IMonth,
        SUM(VAmt)         AS Amt,
        YearId
      FROM dbo.DailyTransImport
      WHERE YearId IN (${placeholders})
      GROUP BY MONTH(UsrDate), MyType, YearId
      ORDER BY MyType, MONTH(UsrDate), YearId
    `);
    
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
