import { NextResponse } from 'next/server';
import webpPool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearId = searchParams.get('yearId');

  if (!yearId) {
    return NextResponse.json({ error: 'yearId is required.' }, { status: 400 });
  }

  try {
    const connectionPool = await webpPool;

    // Get the start date (earliest UsrDate) and end date (latest UsrDate) for the given year
    const result = await connectionPool
      .request()
      .input('yearId', parseInt(yearId))
      .query(`
        SELECT 
          (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId ORDER BY UsrDate ASC) AS StartDate,
          (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId ORDER BY UsrDate DESC) AS EndDate
      `);

    return NextResponse.json(result.recordset[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
