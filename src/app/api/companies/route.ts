import { NextRequest, NextResponse } from 'next/server';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const pool = await webpPool;
    // Adjust the query as needed to fetch the company id and name
    const query = 'SELECT CompanyID, CompanyName FROM [dbo].[tbl_Companies]';
    const result = await pool.request().query(query);
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
