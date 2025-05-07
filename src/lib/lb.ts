// // lib/lb.ts
// import sql from 'mssql';

// export const poolPromise = async (config: sql.config): Promise<sql.ConnectionPool> => {
//   try {
//     const pool = await sql.connect(config);
//     return pool;
//   } catch (error) {
//     throw error;
//   }
// };

// export default poolPromise;


// // lib/lb.ts
// import sql from 'mssql';

//  const poolPromise = async (config: sql.config): Promise<sql.ConnectionPool> => {
//   try {
//     const pool = await sql.connect(config);
//     return pool;
//   } catch (error) {
//     throw error;
//   }
// };


// import sql from 'mssql';

// const config = {
//   user: 'sa',
//   password: 'pankaj@2027',
//   server: 'LAPTOP-SIFBVD7R', // or your IP or hostname
//   database: 'pPlus', // <-- This must match where your SP exists
//   options: {
//     encrypt: false, // true if using Azure
//     trustServerCertificate: true,
//   },
// };
// const poolPromise: Promise<sql.ConnectionPool> = sql.connect(config);
// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then(pool => {
//     console.log('Connected to MSSQL');
//     return pool;
//   })
//   .catch(err => console.error('Database Connection Failed! Bad Config: ', err));

// export default poolPromise;

// lib/db.ts
import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

interface TenantPool {
  pool: ConnectionPool;
  lastUsed: number;
}

const pools: Record<string, TenantPool> = {};

/**
 * Get or create a ConnectionPool for this tenant.
 */
export async function getPoolForTenant(
  companyCode: string,
  cfg: SqlConfig
): Promise<ConnectionPool> {
  // if already exists and not expired, reuse it
  if (pools[companyCode]?.pool?.connected) {
    pools[companyCode]!.lastUsed = Date.now();
    return pools[companyCode]!.pool;
  }

  // Otherwise, close any old pool and create a new one
  if (pools[companyCode]?.pool) {
    await pools[companyCode]!.pool.close();
  }

  const pool = new sql.ConnectionPool(cfg);
  await pool.connect();
  pools[companyCode] = { pool, lastUsed: Date.now() };
  return pool;
}

// Optionally, run a cleanup every X minutes to close idle pools
setInterval(() => {
  const now = Date.now();
  for (const [key, { pool, lastUsed }] of Object.entries(pools)) {
    // close pools idle more than 15 minutes
    if (now - lastUsed > 15 * 60_000) {
      pool.close();
      delete pools[key];
    }
  }
}, 5 * 60_000);
