// /api/party/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const pool = await webpPool;
    const result = await pool
      .request()
      .query(`
        SELECT DISTINCT
          PartyCode,
          Party
        FROM [dbo].[DailyTransImport]
       
        ORDER BY Party,PartyCode;
      `);

    const partyOptions = result.recordset.map((row: {
      PartyCode: string;
      Party: string;
    }) => ({
      value:   `${row.PartyCode} + ${row.Party}`,
      label:  `${row.PartyCode} - ${row.Party}`,  
    }));

    return NextResponse.json(partyOptions);
  } catch (err) {
    console.error('Error fetching party list:', err);
    return NextResponse.json(
      { error: 'Failed to fetch party list' },
      { status: 500 }
    );
  }
}




// // /api/outstanding/party/route.ts
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
//       //     SELECT DISTINCT PartyCode, Party
//       // FROM [dbo].[DailyTransImport]
//       // WHERE ${conditions.join(' AND ')}
//       // ORDER BY Party

//       // SELECT DISTINCT PartyCode, Party
//       // FROM [dbo].[DailyTransImport]
//       // WHERE (VAmt - AdjAmt) > 0
//       // ORDER BY Party;

//     const query = `

//        SELECT DISTINCT PartyCode, Party
//       FROM [dbo].[DailyTransImport]
//       WHERE (VAmt - AdjAmt) > 0
//       ORDER BY Party;

//     `;

//     const result = await request.query(query);

//     const partyOptions = result.recordset.map((row: { PartyCode: number, Party: string }) => ({
//       value: row.PartyCode,
//       label: `${row.PartyCode} - ${row.Party}`,
//     }));

//     return NextResponse.json(partyOptions);
//   } catch (err) {
//     console.error('Error fetching party filter data:', err);
//     return NextResponse.json({ error: 'Failed to fetch party filter data' }, { status: 500 });
//   }
// }
