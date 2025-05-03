// Backend: app/api/transactions/detail/route.ts
import { NextResponse } from 'next/server';
import webpPool from '@/lib/db';

export async function GET(request: Request) {
  const url    = new URL(request.url);
  const from   = url.searchParams.get('fromDate');
  const to     = url.searchParams.get('toDate');
  const yearId = url.searchParams.get('yearId');
  const usr    = url.searchParams.get('usrName');
  const usrDate= url.searchParams.get('usrDate');
  const myType = url.searchParams.get('myType');

  if (!from || !to || !yearId || !usr || !usrDate || !myType) {
    return NextResponse.json(
      { error: 'fromDate, toDate, yearId, usrName, usrDate, and myType are required.' },
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

  try {
    const pool = await webpPool;
    const query = `
      SELECT
        Id as TransactionId,
        UsrName,
        UsrDate,
        MyType,
        VAmt
      FROM DailyTransImport
      WHERE UsrDate = @usrDate
        AND YearId = @yearId
        AND UsrName = @usrName
        AND MyType = @myType
      ORDER BY Id
    `;

    const result = await pool
      .request()
      .input('fromDate', new Date(from))
      .input('toDate',   new Date(to))
      .input('yearId',   year)
      .input('usrName',  usr)
      .input('usrDate',  new Date(usrDate))
      .input('myType',   myType)
      .query(query);

    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('Detail endpoint error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}