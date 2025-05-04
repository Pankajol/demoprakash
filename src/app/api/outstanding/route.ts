
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

/**
 * GET /api/outstanding/party/route.ts
 * Fetches distinct PartyCode and Party options for outstanding transactions,
 * scoped to the authenticated user's company and optional filters.
 */
export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // Extract filters
  const myTypesParam = searchParams.get('myTypes');
  const myTypes = myTypesParam ? myTypesParam.split(',') : [];
  const partyCodeParam = searchParams.get('partyCode');
  const partyCode = partyCodeParam ? decodeURIComponent(partyCodeParam) : null;
  const partyParam = searchParams.get('party');
  const party = partyParam ? decodeURIComponent(partyParam) : null;
  const fromDateParam = searchParams.get('fromDate');
  const toDateParam = searchParams.get('toDate');

  // Authenticate via JWT cookie
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
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Build dynamic WHERE clauses
  const conditions: string[] = ['(VAmt - AdjAmt) > 0', 'companyCode = @companyCode'];
  const pool = await webpPool;
  const request = pool.request()
    .input('companyCode', payload.companyCode);

  if (fromDateParam) {
    conditions.push('UsrDate >= @fromDate');
    request.input('fromDate', new Date(fromDateParam));
  }
  if (toDateParam) {
    conditions.push('UsrDate <= @toDate');
    request.input('toDate', new Date(toDateParam));
  }

  if (partyCode) {
    conditions.push('PartyCode = @partyCode');
    request.input('partyCode', partyCode);
  }
  if (party) {
    conditions.push('Party LIKE @party');
    request.input('party', `%${party}%`);
  }

  if (myTypes.length) {
    const typeConds = myTypes.map((_, i) => `MyType = @type${i}`);
    conditions.push(`(${typeConds.join(' OR ')})`);
    myTypes.forEach((t, i) => request.input(`type${i}`, t));
  }

  const sqlQuery = `
    SELECT DISTINCT PartyCode, Party
    FROM dbo.DailyTransImport
    WHERE ${conditions.join(' AND ')}
    ORDER BY Party;
  `;

  try {
    const result = await request.query(sqlQuery);
    const partyOptions = result.recordset.map((row: { PartyCode: string; Party: string }) => ({
      value: row.PartyCode,
      label: `${row.PartyCode} - ${row.Party}`,
    }));
    return NextResponse.json(partyOptions);
  } catch (err: any) {
    console.error('[OUTSTANDING_PARTY_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch party filter data' },
      { status: 500 }
    );
  }
}




// import { NextRequest, NextResponse } from 'next/server';
// import sql from 'mssql';  // Assuming you're using mssql or other database client

// // Fetch distinct PartyCode and Party for the Select dropdown
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   // Retrieve other query parameters (like myTypes, fromDate, etc.) from searchParams
//   const myTypes = searchParams.get('myTypes')?.split(',') || [];
//   const partyCode = searchParams.get('partyCode');
//   const party = searchParams.get('party');
//   const fromDate = searchParams.get('fromDate');
//   const toDate = searchParams.get('toDate');

//   const query = `
//     SELECT DISTINCT PartyCode, Party
//     FROM [dbo].[DailyTransImport]
//     WHERE 
//       (VAmt - AdjAmt) > 0
//       ${partyCode ? `AND PartyCode = ${partyCode}` : ''}
//       ${party ? `AND Party LIKE '%${party}%'` : ''}
//       ${fromDate ? `AND UsrDate >= '${fromDate}'` : ''}
//       ${toDate ? `AND UsrDate <= '${toDate}'` : ''}
//     ORDER BY Party
//   `;

//   try {
//     const pool = await sql.connect(process.env.DB_CONNECTION_STRING);
//     const result = await pool.request().query(query);

//     // Fetch distinct PartyCode and Party options
//     const partyOptions = result.recordset.map((row: { PartyCode: string, Party: string }) => ({
//       value: row.PartyCode,
//       label: row.Party
//     }));

//     return NextResponse.json(partyOptions);
//   } catch (err) {
//     console.error('Error fetching PartyCode and Party data:', err);
//     return NextResponse.json({ error: 'Failed to fetch PartyCode and Party data' });
//   }
// }
