import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const yearId = req.nextUrl.searchParams.get('yearId');

  if (!yearId) {
    return NextResponse.json({ error: 'Missing yearId' }, { status: 400 });
  }

  try {
    const pool = await db; // Resolve db connection
    const request = pool.request();
    request.input('yearId', Number(yearId));

    const result = await request.query(`
      SELECT 
        (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId ORDER BY UsrDate ASC) AS FromDate,
        (SELECT TOP 1 UsrDate FROM DailyTransImport WHERE YearId = @yearId ORDER BY UsrDate DESC) AS ToDate
    `);

    return NextResponse.json(result.recordset?.[0] || {});
  } catch (error) {
    console.error('Error fetching date range for yearId:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
