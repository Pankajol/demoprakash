"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type RegistrationType = 'company' | 'user';

interface CompanyFormData {
  companyName: string;
  email: string;
  phone: string;
  gstNo: string;
  password: string;
  confirmPassword: string;
}

interface UserFormData {
  username: string;
  companyID: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface CompanyOption {
  CompanyID: string;
  CompanyName: string;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [regType, setRegType] = useState<RegistrationType>('company');
  const [error, setError] = useState<string>('');

  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: '',
    email: '',
    phone: '',
    gstNo: '',
    password: '',
    confirmPassword: '',
  });

  const [userData, setUserData] = useState<UserFormData>({
    username: '',
    companyID: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // State to hold the list of companies fetched from the GET endpoint
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);

  const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  const handleUserChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // When regType is 'user', fetch the companies
  useEffect(() => {
    if (regType === 'user') {
      setLoadingCompanies(true);
      fetch('/api/companies')
        .then((res) => res.json())
        .then((data) => {
          setCompanies(data);
          setLoadingCompanies(false);
        })
        .catch((err) => {
          console.error('Error fetching companies:', err);
          setLoadingCompanies(false);
        });
    }
  }, [regType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    let payload;
    if (regType === 'company') {
      if (companyData.password !== companyData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      payload = { type: regType, ...companyData };
    } else {
      if (userData.password !== userData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      payload = { type: regType, ...userData };
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push('/login');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRegType('company')}
            className={`px-4 py-2 rounded ${
              regType === 'company'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Company
          </button>
          <button
            type="button"
            onClick={() => setRegType('user')}
            className={`px-4 py-2 rounded ${
              regType === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            User
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {regType === 'company' ? (
            <>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium">
                  Company Name
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  value={companyData.companyName}
                  onChange={handleCompanyChange}
                  placeholder="Company Name"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={companyData.email}
                  onChange={handleCompanyChange}
                  placeholder="Email"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={companyData.phone}
                  onChange={handleCompanyChange}
                  placeholder="Phone Number"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="gstNo" className="block text-sm font-medium">
                  GST Number
                </label>
                <input
                  id="gstNo"
                  name="gstNo"
                  value={companyData.gstNo}
                  onChange={handleCompanyChange}
                  placeholder="GST Number"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={companyData.password}
                  onChange={handleCompanyChange}
                  placeholder="Password"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={companyData.confirmPassword}
                  onChange={handleCompanyChange}
                  placeholder="Confirm Password"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={userData.username}
                  onChange={handleUserChange}
                  placeholder="Username"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="companyID" className="block text-sm font-medium">
                  Company
                </label>
                {loadingCompanies ? (
                  <div>Loading companies...</div>
                ) : (
                  <select
                    id="companyID"
                    name="companyID"
                    value={userData.companyID}
                    onChange={handleUserChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.CompanyID} value={company.CompanyID}>
                        {company.CompanyName} (ID: {company.CompanyID})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={userData.phone}
                  onChange={handleUserChange}
                  placeholder="Phone Number"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={userData.password}
                  onChange={handleUserChange}
                  placeholder="Password"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={userData.confirmPassword}
                  onChange={handleUserChange}
                  placeholder="Confirm Password"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Register as {regType === 'company' ? 'Company' : 'User'}
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;




// "use client"
// import React, { useState, ChangeEvent, FormEvent } from 'react';
// import { useRouter } from 'next/navigation';

// type RegistrationType = 'company' | 'user';

// interface CompanyFormData {
//   companyName: string;
//   email: string;
//   phone: string;
//   gstNo: string;
//   password: string;
//   confirmPassword: string;
// }

// interface UserFormData {
//   username: string;
//   companyID: string;
//   phone: string;
//   password: string;
//   confirmPassword: string;
// }

// const RegisterPage: React.FC = () => {
//   const router = useRouter();
//   const [regType, setRegType] = useState<RegistrationType>('company');

//   const [companyData, setCompanyData] = useState<CompanyFormData>({
//     companyName: '',
//     email: '',
//     phone: '',
//     gstNo: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const [userData, setUserData] = useState<UserFormData>({
//     username: '',
//     companyID: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setCompanyData({ ...companyData, [e.target.name]: e.target.value });
//   };

//   const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setUserData({ ...userData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     let payload;
//     if (regType === 'company') {
//       if (companyData.password !== companyData.confirmPassword) {
//         alert('Passwords do not match');
//         return;
//       }
//       payload = { type: regType, ...companyData };
//     } else {
//       if (userData.password !== userData.confirmPassword) {
//         alert('Passwords do not match');
//         return;
//       }
//       payload = { type: regType, ...userData };
//     }
//     const res = await fetch('/api/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });
//     if (res.ok) {
//       router.push('/login');
//     } else {
//       console.error('Registration failed.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
//         <div className="flex justify-center gap-4 mb-6">
//           <button
//             type="button"
//             onClick={() => setRegType('company')}
//             className={`px-4 py-2 rounded ${
//               regType === 'company'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-200 text-gray-800'
//             }`}
//           >
//             Company
//           </button>
//           <button
//             type="button"
//             onClick={() => setRegType('user')}
//             className={`px-4 py-2 rounded ${
//               regType === 'user'
//                 ? 'bg-blue-600 text-white'
//                 : 'bg-gray-200 text-gray-800'
//             }`}
//           >
//             User
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {regType === 'company' ? (
//             <>
//               <div>
//                 <label htmlFor="companyName" className="block text-sm font-medium">
//                   Company Name
//                 </label>
//                 <input
//                   id="companyName"
//                   name="companyName"
//                   value={companyData.companyName}
//                   onChange={handleCompanyChange}
//                   placeholder="Company Name"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium">
//                   Email
//                 </label>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   value={companyData.email}
//                   onChange={handleCompanyChange}
//                   placeholder="Email"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium">
//                   Phone
//                 </label>
//                 <input
//                   id="phone"
//                   name="phone"
//                   type="tel"
//                   value={companyData.phone}
//                   onChange={handleCompanyChange}
//                   placeholder="Phone Number"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="gstNo" className="block text-sm font-medium">
//                   GST Number
//                 </label>
//                 <input
//                   id="gstNo"
//                   name="gstNo"
//                   value={companyData.gstNo}
//                   onChange={handleCompanyChange}
//                   placeholder="GST Number"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium">
//                   Password
//                 </label>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={companyData.password}
//                   onChange={handleCompanyChange}
//                   placeholder="Password"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium">
//                   Confirm Password
//                 </label>
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   value={companyData.confirmPassword}
//                   onChange={handleCompanyChange}
//                   placeholder="Confirm Password"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 <label htmlFor="username" className="block text-sm font-medium">
//                   Username
//                 </label>
//                 <input
//                   id="username"
//                   name="username"
//                   value={userData.username}
//                   onChange={handleUserChange}
//                   placeholder="Username"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="companyID" className="block text-sm font-medium">
//                   Company ID
//                 </label>
//                 <input
//                   id="companyID"
//                   name="companyID"
//                   value={userData.companyID}
//                   onChange={handleUserChange}
//                   placeholder="Company ID"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium">
//                   Phone
//                 </label>
//                 <input
//                   id="phone"
//                   name="phone"
//                   type="tel"
//                   value={userData.phone}
//                   onChange={handleUserChange}
//                   placeholder="Phone Number"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium">
//                   Password
//                 </label>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   value={userData.password}
//                   onChange={handleUserChange}
//                   placeholder="Password"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label htmlFor="confirmPassword" className="block text-sm font-medium">
//                   Confirm Password
//                 </label>
//                 <input
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   type="password"
//                   value={userData.confirmPassword}
//                   onChange={handleUserChange}
//                   placeholder="Confirm Password"
//                   className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </>
//           )}
//           <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
//             Register as {regType === 'company' ? 'Company' : 'User'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
