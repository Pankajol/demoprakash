import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';  // Assuming you're using mssql or other database client

// Fetch distinct PartyCode and Party for the Select dropdown
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Retrieve other query parameters (like myTypes, fromDate, etc.) from searchParams
  const myTypes = searchParams.get('myTypes')?.split(',') || [];
  const partyCode = searchParams.get('partyCode');
  const party = searchParams.get('party');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  const query = `
    SELECT DISTINCT PartyCode, Party
    FROM [dbo].[DailyTransImport]
    WHERE 
      (VAmt - AdjAmt) > 0
      ${partyCode ? `AND PartyCode = ${partyCode}` : ''}
      ${party ? `AND Party LIKE '%${party}%'` : ''}
      ${fromDate ? `AND UsrDate >= '${fromDate}'` : ''}
      ${toDate ? `AND UsrDate <= '${toDate}'` : ''}
    ORDER BY Party
  `;

  try {
    const pool = await sql.connect(process.env.DB_CONNECTION_STRING);
    const result = await pool.request().query(query);

    // Fetch distinct PartyCode and Party options
    const partyOptions = result.recordset.map((row: { PartyCode: string, Party: string }) => ({
      value: row.PartyCode,
      label: row.Party
    }));

    return NextResponse.json(partyOptions);
  } catch (err) {
    console.error('Error fetching PartyCode and Party data:', err);
    return NextResponse.json({ error: 'Failed to fetch PartyCode and Party data' });
  }
}
