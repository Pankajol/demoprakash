// app/api/daily-trans-import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import webpPool from '@/lib/db';

/**
 * GET /api/daily-trans-import
 * Query parameters:
 *   - UsrName: string
 *   - UsrDate: string in DD-MMM-YYYY (e.g. 26-APR-2024)
 *   - MyType: string
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const UsrName = searchParams.get('UsrName');
  const UsrDate = searchParams.get('UsrDate');
  const MyType = searchParams.get('MyType');

  // Validate required parameters
  if (!UsrName || !UsrDate || !MyType) {
    return NextResponse.json(
      { error: 'Missing required query parameters' },
      { status: 400 }
    );
  }

  try {
    // webpPool is a Promise<ConnectionPool>, not a function
    const pool = await webpPool;
    const request = pool.request();
    request.input('UsrName', sql.VarChar, UsrName);
    request.input('UsrDate', sql.VarChar, UsrDate);
    request.input('MyType', sql.VarChar, MyType);

    const result = await request.query(`
      SELECT *
      FROM DailyTransImport
      WHERE UsrName = @UsrName
        AND UsrDate = @UsrDate
        AND MyType = @MyType
    `);

    const rows = result.recordset;

    if (!rows.length) {
      // No records => 404
      return NextResponse.json([], { status: 404 });
    }

    // Return records
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('DailyTransImport API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
