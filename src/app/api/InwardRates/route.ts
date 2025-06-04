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
    ({ payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    ));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const url = new URL(req.url);
  const itemName = url.searchParams.get('ItemName');
  const supplierName = url.searchParams.get('SupplierName');
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam) : 5;

  try {
    const pool = await webpPool;
    const request = pool.request().input('companyCode',  payload.companyCode);

    if (supplierName) {
      request.input('SupplierName', sql.NVarChar(sql.MAX), supplierName);
    }

    if (itemName) {
      request.input('ItemName', sql.NVarChar(sql.MAX), itemName);
    }

    if (limit > 0) {
      request.input('limit', sql.Int, limit);
    }

    let sqlText = `
      SELECT ${limit > 0 ? 'TOP (@limit)' : ''} *
      FROM dbo.tbl_inwardRates
      WHERE companyCode = @companyCode
    `;

    if (supplierName) {
      sqlText += ` AND SupplierName = @SupplierName`;
    }

    if (itemName) {
      sqlText += ` AND ItemName LIKE '%' + @ItemName + '%'`;
    }

    sqlText += ` ORDER BY MyId DESC`;

    const result = await request.query(sqlText);
    const data = result.recordset; // Optional: oldest first

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[INWARD_RATES_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch inward rates', details: err.message },
      { status: 500 }
    );
  }
}


