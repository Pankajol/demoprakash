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

  // read optional filters from querystring
  const url = new URL(req.url);
  const codeFilter = url.searchParams.get('code');
  const search = url.searchParams.get('search')?.trim();

  try {
    const pool = await webpPool;
    const request = pool.request()
      .input('companyCode', payload.companyCode);

    // base SQL
    let sqlText = `
      SELECT
        ProductCode AS code,
        ItemName    AS itemName,
        Pack        AS pack,
        TotalStock  AS qty,
        PTRRate     AS ptr,
        MRPRate     AS mrp,
        MfgName     AS mfgName
      FROM dbo.tbl_stock
      WHERE companyCode = @companyCode
    `;

    // add code filter if present
    if (codeFilter) {
      sqlText += ` AND ProductCode = @code`;
      request.input('code', sql.Int, parseInt(codeFilter, 10));
    }

    // add text search if present
    if (search) {
      sqlText += `
        AND (
          ItemName LIKE '%' + @search + '%' OR
          MfgName  LIKE '%' + @search + '%'
        )
      `;
      request.input('search', sql.VarChar, search);
    }

    const result = await request.query(sqlText);

    // map into the shape our UI expects
    const stockItems = result.recordset.map((row: any) => ({
      code:     row.code,
      itemName: row.itemName,
      pack:     row.pack,
      qty:      row.qty,
      ptr:      row.ptr,
      mrp:      row.mrp,
      mfgName:  row.mfgName,
    }));

    return NextResponse.json(stockItems);
  } catch (err: any) {
    console.error('[STOCK_LIST_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
