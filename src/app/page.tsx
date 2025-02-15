'use client';

import TableGrid from '@/components/TableGrid';

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">MSSQL Tables</h1>
      <TableGrid />
    </main>
  );
}
