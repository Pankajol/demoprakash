import sql, { ConnectionPool } from 'mssql';

declare global {
  var _mssqlPoolPromise: Promise<ConnectionPool> | undefined;
}

const config: sql.config = {
  server:    '103.21.58.192',
  database: 'indusjys_webpPlus',
  user:     'db_aa88c8_pplus_admin',
  password: '?73E08xkq',
  port:      1433,
  options: {
    encrypt: false, // set to true if using Azure or SSL
    trustServerCertificate: true, // useful for development/self-signed certs
  },
  connectionTimeout: 15000,
};

const webpPool: Promise<ConnectionPool> =
  global._mssqlPoolPromise ||
  new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log('✅ Connected to MSSQL');
      global._mssqlPoolPromise = Promise.resolve(pool);
      return pool;
    })
    .catch((err) => {
      console.error('❌ Database Connection Failed!', err);
      throw err;
    });

export default webpPool;





// import sql, { ConnectionPool } from 'mssql';

// declare global {
//   var _mssqlPoolPromise: Promise<ConnectionPool> | undefined;
// }

// // Build a connection string using a named instance.
// // Make sure to use double backslashes to escape the backslash.
// // const connectionString = 'Server=LAPTOP-SIFBVD7R;Database=webpPlus;User Id=sa;Password=pankaj@2027;Encrypt=False;Connection Timeout=15';
// const connectionString = 'Server=103.21.58.192;Database=indusjys_webpPlus;User Id=db_aa88c8_pplus_admin;Password=?73E08xkq;Encrypt=False;Connection Timeout=15';

// const webpPool: Promise<ConnectionPool> =
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

// export default webpPool;




// // src/lib/db.ts
// import sql, { ConnectionPool } from "mssql";

// declare global {
//   var _mssqlPoolPromisePPlus: Promise<ConnectionPool> | undefined;
//   var _mssqlPoolPromiseWebp: Promise<ConnectionPool> | undefined;
// }

// // Connection strings (adjust as needed)
// const connPPlus = 
//   "Server=LAPTOP-SIFBVD7R;Database=pPlus;User Id=sa;Password=pankaj@2027;Encrypt=False;Connection Timeout=15";
// const connWebp  = 
//   "Server=LAPTOP-SIFBVD7R;Database=webpPlus;User Id=sa;Password=pankaj@2027;Encrypt=False;Connection Timeout=15";

// // Pool for pPlus
// const poolPromisePPlus =
//   global._mssqlPoolPromisePPlus ||
//   new ConnectionPool(connPPlus)
//     .connect()
//     .then((pool) => {
//       console.log("🟢 Connected to pPlus");
//       global._mssqlPoolPromisePPlus = Promise.resolve(pool);
//       return pool;
//     })
//     .catch((err) => {
//       console.error("🔴 pPlus Connection Failed!", err);
//       throw err;
//     });

// // Pool for webpPlus
// const poolPromiseWebp =
//   global._mssqlPoolPromiseWebp ||
//   new ConnectionPool(connWebp)
//     .connect()
//     .then((pool) => {
//       console.log("🟢 Connected to webpPlus");
//       global._mssqlPoolPromiseWebp = Promise.resolve(pool);
//       return pool;
//     })
//     .catch((err) => {
//       console.error("🔴 webpPlus Connection Failed!", err);
//       throw err;
//     });

// // Named exports
// export { poolPromisePPlus, poolPromiseWebp };

