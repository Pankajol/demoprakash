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


import sql from 'mssql';

const config = {
  user: 'sa',
  password: 'pankaj@2027',
  server: 'LAPTOP-SIFBVD7R', // or your IP or hostname
  database: 'pPlus', // <-- This must match where your SP exists
  options: {
    encrypt: false, // true if using Azure
    trustServerCertificate: true,
  },
};
const poolPromise: Promise<sql.ConnectionPool> = sql.connect(config);
// const poolPromise = new sql.ConnectionPool(config)
//   .connect()
//   .then(pool => {
//     console.log('Connected to MSSQL');
//     return pool;
//   })
//   .catch(err => console.error('Database Connection Failed! Bad Config: ', err));

export default poolPromise;

