// import { NextRequest, NextResponse } from 'next/server';
// import sql from 'mssql';
// import { jwtVerify } from 'jose';

// const JWT_SECRET = process.env.JWT_SECRET!;

// // In-memory store keyed by companyCode
// const clientConfigs: Record<string, any> = {};

// async function getCompanyCode(req: NextRequest) {
//   const token = req.cookies.get('token')?.value;
//   if (!token) throw new Error('Not authenticated');
//   const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
//   const companyCode = payload.companyCode as string;
//   if (!companyCode) throw new Error('Company code missing');
//   return companyCode;
// }

// export async function POST(req: NextRequest) {
//   const companyCode = await getCompanyCode(req);
//   const { server, database, user, password } = await req.json();

//   const config = { server, database, user, password, options:{encrypt:false,trustServerCertificate:false} };
//   try {
//     const pool = await sql.connect(config);
//     await pool.close();

//     // store under companyCode
//     clientConfigs[companyCode] = config;
//     return NextResponse.json({ message: 'Local DB connected' });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // export the map so other routes can retrieve
// // export { clientConfigs };


// // export async function GET(req: NextRequest) {
// //     try {
// //       const subject = await getSubject(req);
// //       const has = Boolean(clientConfigs[subject]);
// //       return NextResponse.json({ connected: has });
// //     } catch (err: any) {
// //       return NextResponse.json({ connected: false }, { status: 401 });
// //     }
// //   }

// // Export store for import route
// export { clientConfigs };
// app/api/connect-local/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getPoolForTenant } from '@/lib/lb';

const JWT_SECRET = process.env.JWT_SECRET!;

const clientConfigs: Record<string, any> = {};

async function getCompanyCode(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) throw new Error('Not authenticated');
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(JWT_SECRET)
  );
  return payload.companyCode as string;
}

export async function POST(req: NextRequest) {
  const companyCode = await getCompanyCode(req);
  const { server, database, user, password } = await req.json();

  const cfg = {
    server,
    database,
    user,
    password,
    options: {
      encrypt: false,
      trustServerCertificate: true, // often needed for local dev
    },
  };

  try {
    // Attempt to get or create a pool
    const pool = await getPoolForTenant(companyCode, cfg);

    // Simple test query
    await pool.request().query('SELECT 1');

    return NextResponse.json({ message: 'Local DB connected' });
  } catch (err: any) {
    console.error('DB connection error:', err);
    return NextResponse.json(
      { error: err.message || 'Connection failed' },
      { status: 500 }
    );
  }
}

export { clientConfigs };