


'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import sql from 'mssql';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let payload: any;
  try {
    ({ payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET)));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  try {
    const pool = await webpPool;

    const result = await pool.request()
      .input('companyCode', payload.companyCode)
      .query(`
        SELECT DISTINCT ItemName
        FROM dbo.tbl_inwardRates
        WHERE companyCode = @companyCode AND ItemName IS NOT NULL;

        SELECT DISTINCT SupplierName
        FROM dbo.tbl_inwardRates
        WHERE companyCode = @companyCode AND SupplierName IS NOT NULL;
      `);

    const itemNames = result.recordsets[0].map((row: any) => row.ItemName);
    const supplierIds = result.recordsets[1].map((row: any) => row.SupplierName?.toString());

    return NextResponse.json({ itemNames, supplierIds });
  } catch (err: any) {
    console.error('[INWARD_RATES_SUGGESTIONS_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', details: err.message },
      { status: 500 }
    );
  }
}
