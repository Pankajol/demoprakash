
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Extract & validate query params
  const myTypesParam = searchParams.get('myTypes');
  const myTypes = myTypesParam ? myTypesParam.split(',') : ['Sale'];
  const partyCodeParam = searchParams.get('partyCode');
  const partyCode = partyCodeParam ? decodeURIComponent(partyCodeParam) : null;
  const partyParam = searchParams.get('party');
  const party = partyParam ? decodeURIComponent(partyParam) : null;
  const fromDateParam = searchParams.get('fromDate') || '2023-04-01';
  const toDateParam = searchParams.get('toDate')   || '2024-03-31';

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

  // 3. Build WHERE clauses
  const conditions: string[] = ['(VAmt - AdjAmt) > 0', 'companyCode = @companyCode'];

  const pool = await webpPool;
  const request = pool.request()
    .input('companyCode', payload.companyCode)
    .input('fromDate', new Date(fromDateParam))
    .input('toDate',   new Date(toDateParam));

  if (partyCode) {
    conditions.push('PartyCode = @partyCode');
    request.input('partyCode', partyCode);
  }
  if (party) {
    conditions.push('Party LIKE @party');
    request.input('party', `%${party}%`);
  }
  if (myTypes.length > 0) {
    const typeConds = myTypes.map((_, i) => `MyType = @type${i}`);
    conditions.push(`(${typeConds.join(' OR ')})`);
    myTypes.forEach((t, i) => {
      request.input(`type${i}`, t);
    });
  }

  // Ensure date filter uses between
  conditions.push('UsrDate BETWEEN @fromDate AND @toDate');

  const sqlQuery = `
    SELECT 
      PartyCode, 
      Party, 
      MyType, 
      VNo, 
      UsrDate, 
      VAmt, 
      AdjAmt, 
      (VAmt - AdjAmt) AS OS
    FROM dbo.DailyTransImport
    WHERE ${conditions.join(' AND ')}
    ORDER BY UsrDate, VNo
  `;

  // 4. Execute query
  try {
    const result = await request.query(sqlQuery);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[OUTSTANDING_TRANSACTIONS_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}



// // /api/outstanding/transactions/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import sql from 'mssql';
// import webpPool from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const myTypes = searchParams.get('myTypes')?.split(',') || ['Sale'];
//   const partyCode = searchParams.get('partyCode');
//   const party = searchParams.get('party');
//   const fromDate = searchParams.get('fromDate') || '2023-04-01';
//   const toDate = searchParams.get('toDate') || '2024-03-31';

//   try {
//     // const pool = await sql.connect(process.env.DB_CONNECTION_STRING);
//     const pool = await webpPool;
//     // const pool = await sql.connect(process.env.DB_CONNECTION_STRING);    
//     const request = pool.request();

//     const conditions: string[] = ['(VAmt - AdjAmt) > 0'];

//     if (partyCode) {
//       conditions.push('PartyCode = @partyCode');
//       request.input('partyCode', sql.Int, parseInt(partyCode));
//     }

//     if (party) {
//       conditions.push('Party LIKE @party');
//       request.input('party', sql.NVarChar, `%${party}%`);
//     }

//     if (fromDate) {
//       conditions.push('UsrDate >= @fromDate');
//       request.input('fromDate', sql.Date, fromDate);
//     }

//     if (toDate) {
//       conditions.push('UsrDate <= @toDate');
//       request.input('toDate', sql.Date, toDate);
//     }

//     if (myTypes.length > 0) {
//       const typeConditions = myTypes.map((_, i) => `MyType = @type${i}`);
//       conditions.push(`(${typeConditions.join(' OR ')})`);
//       myTypes.forEach((type, i) => {
//         request.input(`type${i}`, sql.NVarChar, type);
//       });
//     }

//     const query = `
//       SELECT 
//         PartyCode, 
//         Party, 
//         MyType, 
//         VNo, 
//         UsrDate, 
//         VAmt, 
//         AdjAmt, 
//         (VAmt - AdjAmt) AS OS
//       FROM [dbo].[DailyTransImport]
//       WHERE ${conditions.join(' AND ')}
//       ORDER BY UsrDate, VNo
//     `;

//     const result = await request.query(query);

//     return NextResponse.json(result.recordset);
//   } catch (error) {
//     console.error('Error fetching outstanding transactions:', error);
//     return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
//   }
// }
