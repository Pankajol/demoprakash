import sql, { ConnectionPool } from 'mssql';

declare global {
  var _mssqlPoolPromise: Promise<ConnectionPool> | undefined;
}

// Build a connection string using a named instance.
// Make sure to use double backslashes to escape the backslash.
const connectionString = 'Server=LAPTOP-SIFBVD7R;Database=pPlus;User Id=sa;Password=pankaj@2027;Encrypt=False;Connection Timeout=15';


const poolPromise: Promise<ConnectionPool> =
  global._mssqlPoolPromise ||
  new ConnectionPool(connectionString)
    .connect()
    .then((pool) => {
      console.log('Connected to MSSQL using Windows Authentication');
      global._mssqlPoolPromise = Promise.resolve(pool);
      return pool;
    })
    .catch((err) => {
      console.error('Database Connection Failed! Check configuration.', err);
      throw err;
    });

export default poolPromise;
