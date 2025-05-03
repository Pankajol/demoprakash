import { NextResponse } from 'next/server';
import db from '@/lib/db'; // This should export a Promise<ConnectionPool>

export async function GET() {
  try {
    const pool = await db; // Wait for the pool to resolve
    const result = await pool.request().query(`
      SELECT DISTINCT YearId 
      FROM DailyTransImport 
      ORDER BY YearId DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching YearIds:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
