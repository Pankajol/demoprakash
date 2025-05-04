// components/DBForm.tsx
import { useState } from 'react';

type DBFormProps = {
  onSuccess: () => void;
  onError?: (msg: string) => void;
};

export default function DBForm({ onSuccess, onError }: DBFormProps) {
  const [form, setForm] = useState({ server: '', database: '', user: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/connect-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      setLoading(false);

      if (res.ok) {
        onSuccess();
      } else {
        const errMsg = result.error || 'Failed to connect.';
        onError?.(errMsg);
      }
    } catch (error: any) {
      setLoading(false);
      const errMsg = error.message || 'Failed to connect.';
      onError?.(errMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-gray-100 p-4 rounded">
      <input
        name="server"
        placeholder="Server"
        onChange={handleChange}
        required
        className="p-2 border text-black rounded"
      />
      <input
        name="database"
        placeholder="Database"
        onChange={handleChange}
        required
        className="p-2 text-black border rounded"
      />
      <input
        name="user"
        placeholder="User"
        onChange={handleChange}
        required
        className="p-2 border text-black rounded"
      />
      <input
        name="password"
        placeholder="Password"
        type="password"
        onChange={handleChange}
        required
        className="p-2 text-black border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Connect'}
      </button>
    </form>
  );
}
