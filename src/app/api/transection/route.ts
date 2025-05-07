// import { NextResponse } from 'next/server';
// import poolPromise from '@/lib/lb';
// import * as sql from 'mssql';

// export const runtime = 'nodejs';

// export async function POST(request: Request) {
//   try {
//     // Parse the JSON body from the request.
//     // Even though we extract these values, the stored procedure
//     // sp_AllYear_Find_DailyTrans currently does not accept any parameters.
//     const { pCoId, pYrId, pFrmDate, pToDate } = await request.json();

//     // Get the connection pool.
//     const pool = await poolPromise;

//     // Execute the stored procedure that exists in the database.
//     // Change the procedure name if you intend to use a procedure that accepts parameters.
//     const result = await pool.request().execute('sp_AllYear_Find_DailyTrans');

//     // Return the recordset as JSON.
//     return NextResponse.json({
//       message: 'Stored procedure executed successfully',
//       data: result.recordset,
//     });
//   } catch (error: any) {
//     console.error('Error executing stored procedure:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error', details: error.message },
//       { status: 500 }
//     );
//   }
// }



// import { NextResponse } from 'next/server';
// import poolPromise from '@/lib/lb';
// import type { ConnectionPool } from 'mssql';
// import * as sql from 'mssql';

// export const runtime = 'nodejs';

// export async function POST(request: Request) {
//   try {
//     // Parse the JSON body from the request
//     const { pCoId, pYrId, pFrmDate, pToDate } = await request.json();

//     // Get the connection pool from your poolPromise
//     // const pool = await poolPromise;
//     const pool: ConnectionPool = await poolPromise;

//     // Execute the stored procedure with the provided parameters.
//     const result = await pool.request()
//       .input('pCoId', sql.Int, Number(pCoId))
//       .input('pYrId', sql.Int, Number(pYrId))
//       .input('pFrmDate', sql.VarChar(12), pFrmDate)
//       .input('pToDate', sql.VarChar(12), pToDate)
//       .execute('[dbo].[sp_RT_Find_DailyTrans]' ); // Use the fully qualified procedure name without square brackets

//     // Return the recordset as JSON
//     return NextResponse.json({
//       message: 'Stored procedure executed successfully',
//       data: result.recordset,
//     });
//   } catch (error: any) {
//     console.error('Error executing stored procedure:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error', details: error.message },
//       { status: 500 }
//     );
//   }
// }
