import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
import webpPool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // const pool = await sql.connect(process.env.DB_CONNECTION_STRING);
    const pool = await webpPool;
    // const pool = await sql.connect(process.env.DB_CONNECTION_STRING);
    const query = `
      SELECT DISTINCT MyType
      FROM [dbo].[DailyTransImport]
      WHERE (VAmt - AdjAmt) > 0
      ORDER BY MyType
    `;
    
    const result = await pool.request().query(query);
    // Close the connection pool after the query        

    // Map the result to return the distinct MyTypes
    const myTypes = result.recordset.map((row: { MyType: string }) => row.MyType);

    return NextResponse.json(myTypes);
  } catch (err) {
    console.error('Error fetching MyTypes:', err);
    return NextResponse.json({ error: 'Failed to fetch MyTypes' }, { status: 500 });
  }
}
