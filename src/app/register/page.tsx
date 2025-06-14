"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CompanyFormData {
  companyName: string;
  email: string;
  phone: string;
  gstNo: string;
  password: string;
  confirmPassword: string;
}

const RegisterCompanyPage: React.FC = () => {
  const router = useRouter();
  const [isDark, setIsDark] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: '',
    email: '',
    phone: '',
    gstNo: '',
    password: '',
    confirmPassword: '',
  });

  // Detect theme
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (companyData.password !== companyData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'company', ...companyData }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const err = await res.json();
        setError(err.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error occurred');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900`}>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Register Company
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {['companyName', 'email', 'phone', 'gstNo', 'password', 'confirmPassword'].map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </label>
              <input
                id={field}
                name={field}
                type={
                  field.toLowerCase().includes('password')
                    ? 'password'
                    : field === 'email'
                    ? 'email'
                    : field === 'phone'
                    ? 'tel'
                    : 'text'
                }
                value={companyData[field as keyof CompanyFormData]}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          ))}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
          >
            Register Company
          </button>
        </form>

        <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterCompanyPage;



// "use client";

// import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// // Types
// type RegistrationType = 'company' | 'user';
// interface CompanyFormData { companyName: string; email: string; phone: string; gstNo: string; password: string; confirmPassword: string; }
// interface UserFormData { username: string; companyID: string; phone: string; password: string; confirmPassword: string; }
// interface CompanyOption { CompanyID: string; CompanyName: string; }

// const RegisterPage: React.FC = () => {
//   const router = useRouter();
//   const [regType, setRegType] = useState<RegistrationType>('company');
//   const [error, setError] = useState<string>('');
//   const [isDark, setIsDark] = useState<boolean>(false);

//   // Form state
//   const [companyData, setCompanyData] = useState<CompanyFormData>({ companyName: '', email: '', phone: '', gstNo: '', password: '', confirmPassword: '' });
//   const [userData, setUserData] = useState<UserFormData>({ username: '', companyID: '', phone: '', password: '', confirmPassword: '' });

//   // Companies for user registration
//   const [companies, setCompanies] = useState<CompanyOption[]>([]);
//   const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);

//   // Theme detection
//   useEffect(() => {
//     const mq = window.matchMedia('(prefers-color-scheme: dark)');
//     setIsDark(mq.matches);
//     const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
//     mq.addEventListener('change', handler);
//     return () => mq.removeEventListener('change', handler);
//   }, []);

//   // Fetch companies when switching to user
//   useEffect(() => {
//     if (regType === 'user') {
//       setLoadingCompanies(true);
//       fetch('/api/companies')
//         .then(res => res.json())
//         .then(data => setCompanies(data))
//         .catch(console.error)
//         .finally(() => setLoadingCompanies(false));
//     }
//   }, [regType]);

//   // Handle input changes
//   const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => setCompanyData({ ...companyData, [e.target.name]: e.target.value });
//   const handleUserChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setUserData({ ...userData, [e.target.name]: e.target.value });

//   // Submit
//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');

//     const payload = regType === 'company'
//       ? (() => {
//           if (companyData.password !== companyData.confirmPassword) { setError('Passwords do not match'); return null; }
//           return { type: regType, ...companyData };
//         })()
//       : (() => {
//           if (userData.password !== userData.confirmPassword) { setError('Passwords do not match'); return null; }
//           return { type: regType, ...userData };
//         })();
//     if (!payload) return;

//     try {
//       const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
//       if (res.ok) router.push('/login');
//       else {
//         const err = await res.json();
//         setError(err.error || 'Registration failed');
//       }
//     } catch (e) {
//       console.error(e);
//       setError('Unexpected error occurred');
//     }
//   };

//   return (
//     <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 transition-colors`}>      
//       <div className={`w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow`}>  
//         <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Register</h1>

//         {/* Toggle buttons */}
//         <div className="flex justify-center gap-4 mb-6">
//           {['company','user'].map(type => (
//             <button
//               key={type}
//               type="button"
//               onClick={() => setRegType(type as RegistrationType)}
//               className={`px-4 py-2 rounded focus:outline-none ${regType===type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
//             >
//               {type.charAt(0).toUpperCase() + type.slice(1)}
//             </button>
//           ))}
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {regType === 'company' ? (
//             <>             
//               {['companyName','email','phone','gstNo','password','confirmPassword'].map(field => (
//                 <div key={field}>
//                   <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-200">{field.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</label>
//                   <input
//                     id={field}
//                     name={field}
//                     type={field.toLowerCase().includes('password') ? 'password' : field==='email'?'email': field==='phone'?'tel':'text'}
//                     value={companyData[field as keyof CompanyFormData] as string}
//                     onChange={handleCompanyChange}
//                     className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               ))}
//             </>
//           ) : (
//             <>
//               {/* Username */}
//               <div>
//                 <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
//                 <input
//                   id="username" name="username" type="text" value={userData.username} onChange={handleUserChange}
//                   className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                 />
//               </div>

//               {/* Company select */}
//               <div>
//                 <label htmlFor="companyID" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Company</label>
//                 {loadingCompanies ? <div>Loading companies...</div> : (
//                   <select
//                     id="companyID" name="companyID" value={userData.companyID} onChange={handleUserChange}
//                     className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                   >
//                     <option value="">Select Company</option>
//                     {companies.map(c => <option key={c.CompanyID} value={c.CompanyID}>{c.CompanyName}</option>)}
//                   </select>
//                 )}
//               </div>

//               {/* Phone, password, confirmPassword */}
//               {['phone','password','confirmPassword'].map(field => (
//                 <div key={field}>
//                   <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-200">{field.replace(/^./,s=>s.toUpperCase())}</label>
//                   <input
//                     id={field} name={field} type={field.includes('password')?'password':'tel'} value={userData[field as keyof UserFormData] as string} onChange={handleUserChange}
//                     className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
//                   />
//                 </div>
//               ))}
//             </>
//           )}

//           {error && <div className="text-red-500 text-sm">{error}</div>}

//           <button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
//           >
//             Register as {regType.charAt(0).toUpperCase()+regType.slice(1)}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-gray-700 dark:text-gray-300">Already have an account?{' '}
//           <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;