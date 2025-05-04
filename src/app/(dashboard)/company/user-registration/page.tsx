"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';

interface UserFormData {
  id?: string;
  username: string;
  companyCode: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
}

interface CompanyOption {
  CompanyCode: string;
  CompanyName: string;
}

interface UserRecord {
  id: string;
  username: string;
  companyCode: string;
  phone: string;
  status: boolean | number;
}

export default function RegisterManagerPage() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentUser, setCurrentUser] = useState<UserFormData>({ username: '', companyCode: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string>('');

  // Fetch companies with code
  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data.companyCode && data.type === 'company') {
          setCurrentUser(u => ({ ...u, companyCode: data.companyCode }));
        }
      })
      .catch(console.error);
  }, []);

  // Fetch users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user-register');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { users: list } = await res.json();
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error loading users:', e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadUsers(); }, []);

  // Toggle status
  const toggleStatus = async (id: string, current: boolean | number) => {
    try {
      await fetch(`/api/user-update/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: current ? 0 : 1 }),
      });
      loadUsers();
    } catch (e) {
      console.error('Status toggle failed:', e);
    }
  };

  const openCreateModal = () => {
    setFormMode('create');
    setCurrentUser({ username: '', companyCode: '', phone: '', password: '', confirmPassword: '' });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (u: UserRecord) => {
    setFormMode('edit');
    setCurrentUser({ id: u.id, username: u.username, companyCode: u.companyCode, phone: u.phone });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (formMode === 'create' && currentUser.password !== currentUser.confirmPassword) {
      setError('Passwords mismatch');
      return;
    }
    const url = formMode === 'create'
      ? '/api/user-register'
      : `/api/user-update/${currentUser.id}`;
    const method = formMode === 'create' ? 'POST' : 'PUT';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser),
      });
      if (res.ok) {
        setModalOpen(false);
        loadUsers();
      } else {
        const { error } = await res.json();
        setError(error || 'Failed');
      }
    } catch (e) {
      console.error('Submit error:', e);
      setError('Unexpected');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              {/* <th className="p-2">ID</th> */}
              <th className="p-2">User</th>
              <th className="p-2">Company Code</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                {/* <td className="p-2">{u.id}</td> */}
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.companyCode}</td>
                <td className="p-2">{u.phone}</td>
                <td className="p-2">
                  <button
                    onClick={() => toggleStatus(u.id, u.status)}
                    className={`px-2 py-1 rounded ${u.status ? 'bg-green-200' : 'bg-red-200'}`}
                  >
                    {u.status ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => openEditModal(u)}
                    className="px-2 py-1 bg-yellow-200 rounded"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
      >
        <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">
            {formMode === 'create' ? 'Register User' : 'Edit User'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                name="username"
                value={currentUser.username}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Company Code</label>
              <select
  name="companyCode"
  value={currentUser.companyCode}
  onChange={handleChange}
  className="..."
>
  {companies.map(c => (
    <option key={c.CompanyCode} value={c.CompanyCode}>
      {c.CompanyName} ({c.CompanyCode})
    </option>
  ))}
</select>
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                name="phone"
                type="tel"
                value={currentUser.phone}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
              />
            </div>
            {formMode === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={currentUser.password}
                    onChange={handleChange}
                    className="mt-1 w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={currentUser.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 w-full border rounded p-2"
                  />
                </div>
              </>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {formMode === 'create' ? 'Register' : 'Update'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}




// "use client";
// import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// import { Dialog } from '@headlessui/react';

// interface UserFormData {
//   id?: string;
//   username: string;
//   companyID: string;
//   phone: string;
//   password?: string;
//   confirmPassword?: string;
// }

// interface CompanyOption {
//   CompanyID: string;
//   CompanyName: string;
// }

// interface UserRecord {
//   id: string;
//   username: string;
//   companyID: string;
//   phone: string;
//   status: boolean | number;
// }

// export default function RegisterManagerPage() {
//   const [companies, setCompanies] = useState<CompanyOption[]>([]);
//   const [users, setUsers] = useState<UserRecord[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
//   const [currentUser, setCurrentUser] = useState<UserFormData>({ username: '', companyID: '', phone: '', password: '', confirmPassword: '' });
//   const [error, setError] = useState<string>('');

//   // Fetch companies
//   useEffect(() => {
//     fetch('/api/companies')
//       .then(r => r.json())
//       .then(data => setCompanies(data))
//       .catch(console.error);
//   }, []);

//   // Fetch users
//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('/api/user-register');
//       if (!res.ok) throw new Error(`Status ${res.status}`);
//       const { users: list } = await res.json();
//       setUsers(Array.isArray(list) ? list : []);
//     } catch (e) {
//       console.error('Error loading users:', e);
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => { loadUsers(); }, []);

//   // Toggle status (active/inactive)
//   const toggleStatus = async (id: string, current: boolean | number) => {
//     try {
//       await fetch(`/api/user-update/${id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: current ? 0 : 1 }),
//       });
//       loadUsers();
//     } catch (e) {
//       console.error('Status toggle failed:', e);
//     }
//   };

//   const openCreateModal = () => {
//     setFormMode('create');
//     setCurrentUser({ username: '', companyID: '', phone: '', password: '', confirmPassword: '' });
//     setError('');
//     setModalOpen(true);
//   };

//   const openEditModal = (u: UserRecord) => {
//     setFormMode('edit');
//     setCurrentUser({ id: u.id, username: u.username, companyID: u.companyID, phone: u.phone });
//     setError('');
//     setModalOpen(true);
//   };

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
//     setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (formMode === 'create' && currentUser.password !== currentUser.confirmPassword) {
//       setError('Passwords mismatch');
//       return;
//     }
//     const url = formMode === 'create'
//       ? '/api/user-register'
//       : `/api/user-update/${currentUser.id}`;
//     const method = formMode === 'create' ? 'POST' : 'PUT';
//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(currentUser),
//       });
//       if (res.ok) {
//         setModalOpen(false);
//         loadUsers();
//       } else {
//         const { error } = await res.json();
//         setError(error || 'Failed');
//       }
//     } catch (e) {
//       console.error('Submit error:', e);
//       setError('Unexpected');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="flex justify-between mb-4">
//         <h1 className="text-2xl font-bold">Users</h1>
//         <button
//           onClick={openCreateModal}
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Add User
//         </button>
//       </div>

//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         <table className="w-full bg-white rounded shadow">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="p-2">ID</th>
//               <th className="p-2">User</th>
//               <th className="p-2">Company</th>
//               <th className="p-2">Phone</th>
//               <th className="p-2">Status</th>
//               <th className="p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map(u => (
//               <tr key={u.id} className="border-t">
//                 <td className="p-2">{u.id}</td>
//                 <td className="p-2">{u.username}</td>
//                 <td className="p-2">{u.companyID}</td>
//                 <td className="p-2">{u.phone}</td>
//                 <td className="p-2">
//                   <button
//                     onClick={() => toggleStatus(u.id, u.status)}
//                     className={`px-2 py-1 rounded ${u.status ? 'bg-green-200' : 'bg-red-200'}`}
//                   >
//                     {u.status ? 'Active' : 'Inactive'}
//                   </button>
//                 </td>
//                 <td className="p-2 text-center">
//                   <button
//                     onClick={() => openEditModal(u)}
//                     className="px-2 py-1 bg-yellow-200 rounded"
//                   >
//                     Edit
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* Modal */}
//       <Dialog
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
//       >
//         <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
//           <Dialog.Title className="text-xl font-bold mb-4">
//             {formMode === 'create' ? 'Register User' : 'Edit User'}
//           </Dialog.Title>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium">Username</label>
//               <input
//                 name="username"
//                 value={currentUser.username}
//                 onChange={handleChange}
//                 className="mt-1 w-full border rounded p-2"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Company</label>
//               <select
//                 name="companyID"
//                 value={currentUser.companyID}
//                 onChange={handleChange}
//                 className="mt-1 w-full border rounded p-2"
//               >
//                 <option value="">Select Company</option>
//                 {companies.map(c => (
//                   <option key={c.CompanyID} value={c.CompanyID}>
//                     {c.CompanyName}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Phone</label>
//               <input
//                 name="phone"
//                 type="tel"
//                 value={currentUser.phone}
//                 onChange={handleChange}
//                 className="mt-1 w-full border rounded p-2"
//               />
//             </div>
//             {formMode === 'create' && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium">Password</label>
//                   <input
//                     name="password"
//                     type="password"
//                     value={currentUser.password}
//                     onChange={handleChange}
//                     className="mt-1 w-full border rounded p-2"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium">Confirm Password</label>
//                   <input
//                     name="confirmPassword"
//                     type="password"
//                     value={currentUser.confirmPassword}
//                     onChange={handleChange}
//                     className="mt-1 w-full border rounded p-2"
//                   />
//                 </div>
//               </>
//             )}
//             {error && <div className="text-red-500 text-sm">{error}</div>}
//             <div className="flex justify-end space-x-2">
//               <button
//                 type="button"
//                 onClick={() => setModalOpen(false)}
//                 className="px-4 py-2 rounded border"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 {formMode === 'create' ? 'Register' : 'Update'}
//               </button>
//             </div>
//           </form>
//         </Dialog.Panel>
//       </Dialog>
//     </div>
//   );
// }




