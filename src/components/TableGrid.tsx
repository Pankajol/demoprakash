// 
// components/TablesList.jsx
import { useState, useEffect } from 'react';

export default function TablesList() {
  const [tablesData, setTablesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await fetch('/api/tables');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        setTablesData(data.tables);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  if (loading) return <div>Loading tables...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Database Tables</h1>
      <ul>
        {tablesData.map((table, idx) => (
          <li key={idx} style={{ marginBottom: '1rem' }}>
            <strong>{table.TableName}</strong>
            <div>User Name: {table.UsrName}</div>
            <div>Access_GrpId: {table.Access_GrpId}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
