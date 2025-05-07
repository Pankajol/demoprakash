// // src/app/api/tables/route.ts
// import { NextResponse } from 'next/server';
// // import poolPromise from '@/lib/lb';

// export async function GET() {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query(`
//  select * from [dbo].[tbl_Users]

//     `);
//     return NextResponse.json({ tables: result.recordset });
//   } catch (error: any) {
//     console.error('Error fetching tables:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
