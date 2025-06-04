import { NextResponse,NextRequest } from 'next/server';
import db from '@/lib/db'; // This should export a Promise<ConnectionPool>
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  try {

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let payload: any;
    try {
      const { payload: userPayload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      payload = userPayload;
      // console.log("Decoded JWT Payload:", payload);
    } catch (_e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const pool = await db; // Wait for the pool to resolve
    
    const result = await pool.request()
    .input('companyCode', payload.companyCode)
    .query(`
      SELECT DISTINCT YearId 
      FROM DailyTransImport 
      WHERE  companyCode = @companyCode
      ORDER BY YearId DESC
    `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching YearIds:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
