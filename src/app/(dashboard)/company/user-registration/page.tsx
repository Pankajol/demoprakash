"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Dialog } from '@headlessui/react';

interface UserFormData {
  id?: string;
  username: string;
  companyID: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
}

interface CompanyOption {
  CompanyID: string;
  CompanyName: string;
}

interface UserRecord {
  id: string;
  username: string;
  companyID: string;
  phone: string;
  status: boolean | number;
}

export default function RegisterManagerPage() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentUser, setCurrentUser] = useState<UserFormData>({ username: '', companyID: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string>('');

  // Fetch companies
  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => setCompanies(data))
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

  // Toggle status (active/inactive)
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
    setCurrentUser({ username: '', companyID: '', phone: '', password: '', confirmPassword: '' });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (u: UserRecord) => {
    setFormMode('edit');
    setCurrentUser({ id: u.id, username: u.username, companyID: u.companyID, phone: u.phone });
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
              <th className="p-2">ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Company</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.companyID}</td>
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
              <label className="block text-sm font-medium">Company</label>
              <select
                name="companyID"
                value={currentUser.companyID}
                onChange={handleChange}
                className="mt-1 w-full border rounded p-2"
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.CompanyID} value={c.CompanyID}>
                    {c.CompanyName}
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
//   UserID?: string;
//   Username: string;
//   CompanyID: string;
//   Phone: string;
//   Password?: string;
//   ConfirmPassword?: string;
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
//   const [currentUser, setCurrentUser] = useState<UserFormData>({
//     Username: '',
//     CompanyID: '',
//     Phone: '',
//     Password: '',
//     ConfirmPassword: '',
//   });
//   const [error, setError] = useState<string>('');

//   // Fetch list of companies
//   useEffect(() => {
//     fetch('/api/companies')
//       .then(res => res.json())
//       .then(data => setCompanies(data))
//       .catch(console.error);
//   }, []);

//   // Fetch list of users
//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('/api/user-register');
//       if (!res.ok) throw new Error(`Status ${res.status}`);
//       const data = await res.json();
//       setUsers(Array.isArray(data.users) ? data.users : []);
//     } catch (e) {
//       console.error('Error loading users:', e);
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUsers();
//   }, []);

//   const openCreateModal = () => {
//     setFormMode('create');
//     setCurrentUser({ Username: '', CompanyID: '', Phone: '', Password: '', ConfirmPassword: '' });
//     setError('');
//     setModalOpen(true);
//   };

//   const openEditModal = (user: UserRecord) => {
//     setFormMode('edit');
//     setCurrentUser({
//       UserID: user.id,
//       Username: user.username,
//       CompanyID: user.companyID,
//       Phone: user.phone,
//     });
//     setError('');
//     setModalOpen(true);
//   };

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (formMode === 'create' && currentUser.Password !== currentUser.ConfirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }
//     const url = formMode === 'create' ? '/api/user-register' : `/api/user-update/${currentUser.UserID}`;
//     const method = formMode === 'create' ? 'POST' : 'PUT';
//     const payload = {
//       username: currentUser.Username,
//       companyID: currentUser.CompanyID,
//       phone: currentUser.Phone,
//       password: currentUser.Password,
//       confirmPassword: currentUser.ConfirmPassword,
//     };
//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) {
//         setModalOpen(false);
//         loadUsers();
//       } else {
//         const err = await res.json();
//         setError(err.error || 'Operation failed');
//       }
//     } catch (err) {
//       console.error('Submit error:', err);
//       setError('Unexpected error');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">User Management</h1>
//         <button onClick={openCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//           Add User
//         </button>
//       </div>
//       {loading ? (
//         <div>Loading users...</div>
//       ) : (
//         <table className="w-full bg-white rounded shadow overflow-hidden">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="p-2 text-left">ID</th>
//               <th className="p-2 text-left">Username</th>
//               <th className="p-2 text-left">Company</th>
//               <th className="p-2 text-left">Phone</th>
//               <th className="p-2 text-left">Status</th>
//               <th className="p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map(user => (
//               <tr key={user.id} className="border-t">
//                 <td className="p-2">{user.id}</td>
//                 <td className="p-2">{user.username}</td>
//                 <td className="p-2">{user.companyID}</td>
//                 <td className="p-2">{user.phone}</td>
//                 <td className="p-2">{user.status ? 'Active' : 'Inactive'}</td>
//                 <td className="p-2 text-center">
//                   <button onClick={() => openEditModal(user)} className="px-2 py-1 bg-yellow-200 rounded">
//                     Edit
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {/* Modal */}
//       <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
//         <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md">
//           <Dialog.Title className="text-xl font-bold mb-4">{formMode === 'create' ? 'Register User' : 'Edit User'}</Dialog.Title>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium">Username</label>
//               <input name="Username" value={currentUser.Username} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Company</label>
//               <select name="CompanyID" value={currentUser.CompanyID} onChange={handleChange} className="mt-1 w-full border rounded p-2">
//                 <option value="">Select Company</option>
//                 {companies.map(c => (
//                   <option key={c.CompanyID} value={c.CompanyID}>{c.CompanyName}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Phone</label>
//               <input name="Phone" type="tel" value={currentUser.Phone} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
//             </div>
//             {formMode === 'create' && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium">Password</label>
//                   <input name="Password" type="password" value={currentUser.Password} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium">Confirm Password</label>
//                   <input name="ConfirmPassword" type="password" value={currentUser.ConfirmPassword} onChange={handleChange} className="mt-1 w-full border rounded p-2" />
//                 </div>
//               </>
//             )}
//             {error && <div className="text-red-500 text-sm">{error}</div>}
//             <div className="flex justify-end space-x-2">
//               <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{formMode === 'create' ? 'Register' : 'Update'}</button>
//             </div>
//           </form>
//         </Dialog.Panel>
//       </Dialog>
//     </div>
//   );
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////




// "use client";

// import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// interface UserFormData {
//   username: string;
//   companyID: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
// }

// interface CompanyOption {
//   CompanyID: string;
//   CompanyName: string;
// }

// const RegisterPage: React.FC = () => {
//   const router = useRouter();
//   const [error, setError] = useState<string>('');
//   const [userData, setUserData] = useState<UserFormData>({
//     username: '',
//     companyID: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//   });

//   // State to hold the list of companies fetched from the API
//   const [companies, setCompanies] = useState<CompanyOption[]>([]);
//   const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);

//   const handleUserChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setUserData({ ...userData, [e.target.name]: e.target.value });
//   };

//   // Fetch companies once when the component mounts
//   useEffect(() => {
//     setLoadingCompanies(true);
//     fetch('/api/companies')
//       .then((res) => res.json())
//       .then((data) => {
//         setCompanies(data);
//         setLoadingCompanies(false);
//       })
//       .catch((err) => {
//         console.error('Error fetching companies:', err);
//         setLoadingCompanies(false);
//       });
//   }, []);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (userData.password !== userData.confirmPassword) {
//       alert('Passwords do not match');
//       return;
//     }

//     const payload = { type: 'user', ...userData };

//     try {
//       const res = await fetch('/api/user-register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (res.ok) {
//         router.push('/company'); // Redirect to the company dashboard after successful registration
//       } else {
//         const errorData = await res.json();
//         setError(errorData.error || 'Registration failed.');
//       }
//     } catch (err) {
//       console.error('Registration error:', err);
//       setError('An unexpected error occurred.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">User Registration</h1>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label htmlFor="username" className="block text-sm font-medium">
//               Username
//             </label>
//             <input
//               id="username"
//               name="username"
//               value={userData.username}
//               onChange={handleUserChange}
//               placeholder="Username"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="companyID" className="block text-sm font-medium">
//               Company
//             </label>
//             {loadingCompanies ? (
//               <div>Loading companies...</div>
//             ) : (
//               <select
//                 id="companyID"
//                 name="companyID"
//                 value={userData.companyID}
//                 onChange={handleUserChange}
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">Select Company</option>
//                 {companies.map((company) => (
//                   <option key={company.CompanyID} value={company.CompanyID}>
//                     {company.CompanyName} (ID: {company.CompanyID})
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>
//           <div>
//             <label htmlFor="phone" className="block text-sm font-medium">
//               Phone
//             </label>
//             <input
//               id="phone"
//               name="phone"
//               type="tel"
//               value={userData.phone}
//               onChange={handleUserChange}
//               placeholder="Phone Number"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium">
//               Password
//             </label>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               value={userData.password}
//               onChange={handleUserChange}
//               placeholder="Password"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label htmlFor="confirmPassword" className="block text-sm font-medium">
//               Confirm Password
//             </label>
//             <input
//               id="confirmPassword"
//               name="confirmPassword"
//               type="password"
//               value={userData.confirmPassword}
//               onChange={handleUserChange}
//               placeholder="Confirm Password"
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           {error && (
//             <div className="text-red-500 text-sm">
//               {error}
//             </div>
//           )}
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
//           >
//             Register as User
//           </button>
//         </form>
//         <p className="mt-4 text-center">
//           Already have an account?{' '}
//           <Link href="/login" className="text-blue-600 hover:underline">
//             Login here
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
