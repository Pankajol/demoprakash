'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import sql from 'mssql';
import webpPool from '@/lib/db';

/**
 * GET /api/daily-trans-import
 * Query params: UsrName, UsrDate (DD-MMM-YYYY), MyType
 * Secured: requires valid JWT in HTTP-only 'token' cookie; filters by companyCode
 */
export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Validate query parameters
  const usrName = searchParams.get('UsrName');
  const usrDate = searchParams.get('UsrDate');
  const myType  = searchParams.get('MyType');
  if (!usrName || !usrDate || !myType) {
    return NextResponse.json(
      { error: 'Missing required query parameters: UsrName, UsrDate, and MyType' },
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
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Query database
  try {
    const pool = await webpPool;
    const request = pool.request()
      .input('UsrName', sql.VarChar(100), usrName)
      .input('UsrDate', sql.VarChar(20), usrDate)
      .input('MyType',  sql.VarChar(50), myType)
      .input('companyCode', sql.VarChar(50), payload.companyCode);

    const result = await request.query(`
      SELECT *
      FROM dbo.DailyTransImport
      WHERE UsrName     = @UsrName
        AND UsrDate     = @UsrDate
        AND MyType      = @MyType
        AND companyCode = @companyCode
    `);

    const rows = result.recordset;
    return NextResponse.json(rows, { status: rows.length ? 200 : 404 });

  } catch (error: any) {
    console.error('[DAILY_TRANS_IMPORT_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


