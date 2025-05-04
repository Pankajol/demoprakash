'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const url      = new URL(req.url);
  const usrName  = url.searchParams.get('usrName');
  const usrDateS = url.searchParams.get('usrDate');
  const yearIdS  = url.searchParams.get('yearId');
  const myType   = url.searchParams.get('myType');

  // 1. Validate required query params
  if (!usrName || !usrDateS || !yearIdS || !myType) {
    return NextResponse.json(
      { error: 'usrName, usrDate, yearId, and myType are all required.' },
      { status: 400 }
    );
  }
  const yearId = parseInt(yearIdS, 10);
  if (Number.isNaN(yearId)) {
    return NextResponse.json(
      { error: 'yearId must be a valid integer.' },
      { status: 400 }
    );
  }
  const usrDate = new Date(usrDateS);
  if (isNaN(usrDate.getTime())) {
    return NextResponse.json(
      { error: 'usrDate must be a valid date string.' },
      { status: 400 }
    );
  }

  // 2. Authenticate & decode JWT
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
  } catch (e) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Query details for this specific transaction set
  try {
    const pool = await webpPool;
    const request = pool.request()
      .input('usrName',  usrName)
      .input('usrDate',  usrDate)
      .input('yearId',   yearId)
      .input('myType',   myType)
      .input('companyCode', payload.companyCode);

    const result = await request.query(`
      SELECT
        Id         AS TransactionId,
        UsrName,
        UsrDate,
        MyType,
        VAmt
      FROM DailyTransImport
      WHERE UsrDate    = @usrDate
        AND YearId      = @yearId
        AND UsrName     = @usrName
        AND MyType      = @myType
        AND companyCode = @companyCode
      ORDER BY Id
    `);

    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[DETAILS_FETCH_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}




// Backend: app/api/transactions/detail/route.ts
// import { NextResponse } from 'next/server';
// import webpPool from '@/lib/db';
// import { jwtVerify } from 'jose';

// export async function GET(request: Request) {
//   const JWT_SECRET = process.env.JWT_SECRET!;
//   const url    = new URL(request.url);
//   const from   = url.searchParams.get('fromDate');
//   const to     = url.searchParams.get('toDate');
//   const yearId = url.searchParams.get('yearId');
//   const usr    = url.searchParams.get('usrName');
//   const usrDate= url.searchParams.get('usrDate');
//   const myType = url.searchParams.get('myType');

//   if (!from || !to || !yearId || !usr || !usrDate || !myType) {
//     return NextResponse.json(
//       { error: 'fromDate, toDate, yearId, usrName, usrDate, and myType are required.' },
//       { status: 400 }
//     );
//   }
//   const year = parseInt(yearId, 10);
//   if (isNaN(year)) {
//     return NextResponse.json(
//       { error: 'yearId must be a valid integer.' },
//       { status: 400 }
//     );
//   }

//   try {
//     const token = req.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//     }

//     let payload: any;
//     try {
//       const { payload: userPayload } = await jwtVerify(
//         token,
//         new TextEncoder().encode(JWT_SECRET)
//       );
//       payload = userPayload;
//       console.log("Decoded JWT Payload:", payload);
//     } catch (_e) {
//       return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
//     }

//     const pool = await webpPool;
//     const query = `
//       SELECT
//         Id as TransactionId,
//         UsrName,
//         UsrDate,
//         MyType,
//         VAmt
//       FROM DailyTransImport
//       WHERE UsrDate = @usrDate
//         AND YearId = @yearId
//         AND UsrName = @usrName
//         AND MyType = @myType
//         AND companyCode = @companyCode
//       ORDER BY Id
//     `;

//     const result = await pool
//       .request()
//       .input('fromDate', new Date(from))
//       .input('toDate',   new Date(to))
//       .input('yearId',   year)
//       .input('usrName',  usr)
//       .input('usrDate',  new Date(usrDate))
//       .input('myType',   myType)
//       .query(query);

//     return NextResponse.json(result.recordset);
//   } catch (err: any) {
//     console.error('Detail endpoint error:', err);
//     return NextResponse.json(
//       { error: err.message || 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }