// import sql, { ConnectionPool } from 'mssql';

// declare global {
//   var _mssqlPoolPromise: Promise<ConnectionPool> | undefined;
// }

// // Build a connection string using a named instance.
// // Make sure to use double backslashes to escape the backslash.
// const connectionString = 'Server=LAPTOP-SIFBVD7R;Database=pPlus;User Id=sa;Password=pankaj@2027;Encrypt=False;Connection Timeout=15';


// const poolPromise: Promise<ConnectionPool> =
//   global._mssqlPoolPromise ||
//   new ConnectionPool(connectionString)
//     .connect()
//     .then((pool) => {
//       console.log('Connected to MSSQL using Windows Authentication');
//       global._mssqlPoolPromise = Promise.resolve(pool);
//       return pool;
//     })
//     .catch((err) => {
//       console.error('Database Connection Failed! Check configuration.', err);
//       throw err;
//     });

// export default poolPromise;



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

