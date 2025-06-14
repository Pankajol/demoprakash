// 'use client';

// import React, { useState, FormEvent, ChangeEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { toast } from 'react-toastify';

// type LoginType = 'company' | 'user';

// const LoginPage: React.FC = () => {
//   const router = useRouter();
//   const [loginType, setLoginType] = useState<LoginType>('company');
//   const [email, setEmail] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
  
//     const payload =
//       loginType === 'company'
//         ? { type: 'company', email, password }
//         : { type: 'user', username, password };
  
//     try {
//       const res = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',          // ← include this!
//         body: JSON.stringify(payload),
//       });
  
//       if (!res.ok) {
//         const errorData = await res.json();
//         toast.error(errorData.error || 'Login failed');
//         return;
//       }
  
//       const data = await res.json();
//       if (data.user.status === 0) {
//         toast.warning('Your account is inactive. Please contact support.');
//         return;
//       }
  
//       // You can still store non-sensitive user info if desired:
//       localStorage.setItem('user', JSON.stringify(data.user));
  
//       toast.success('Login successful!');
//       router.replace(loginType === 'company' ? '/company' : '/user');
//     } catch (err) {
//       console.error(err);
//       toast.error('An unexpected error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   return (
//     // <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//     //   <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//     //     <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

//     //     <div className="flex justify-center gap-4 mb-6">
//     //       <button
//     //         type="button"
//     //         onClick={() => setLoginType('company')}
//     //         className={`px-4 py-2 rounded ${loginType === 'company' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
//     //         disabled={loading}
//     //       >
//     //         Company
//     //       </button>
//     //       <button
//     //         type="button"
//     //         onClick={() => setLoginType('user')}
//     //         className={`px-4 py-2 rounded ${loginType === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
//     //         disabled={loading}
//     //       >
//     //         User
//     //       </button>
//     //     </div>

//     //     <form onSubmit={handleSubmit} className="space-y-4">
//     //       {loginType === 'company' ? (
//     //         <div>
//     //           <label htmlFor="email" className="block text-sm font-medium">Email</label>
//     //           <input
//     //             id="email"
//     //             type="email"
//     //             value={email}
//     //             onChange={(e) => setEmail(e.target.value)}
//     //             placeholder="Enter your email"
//     //             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//     //             disabled={loading}
//     //           />
//     //         </div>
//     //       ) : (
//     //         <div>
//     //           <label htmlFor="username" className="block text-sm font-medium">Username</label>
//     //           <input
//     //             id="username"
//     //             type="text"
//     //             value={username}
//     //             onChange={(e) => setUsername(e.target.value)}
//     //             placeholder="Enter your username"
//     //             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//     //             disabled={loading}
//     //           />
//     //         </div>
//     //       )}
//     //       <div>
//     //         <label htmlFor="password" className="block text-sm font-medium">Password</label>
//     //         <input
//     //           id="password"
//     //           type="password"
//     //           value={password}
//     //           onChange={(e) => setPassword(e.target.value)}
//     //           placeholder="Enter your password"
//     //           className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//     //           disabled={loading}
//     //         />
//     //       </div>
//     //       <button
//     //         type="submit"
//     //         className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
//     //         disabled={loading}
//     //       >
//     //         {loading ? 'Logging in...' : `Login as ${loginType === 'company' ? 'Company' : 'User'}`}
//     //       </button>
//     //     </form>

//     //     <p className="mt-4 text-center">
//     //       Don't have an account?{' '}
//     //       <Link href="/register" className="text-blue-600 hover:underline">
//     //         Create an account
//     //       </Link>
//     //     </p>
//     //   </div>
//     // </div>



//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//   <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//     <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

//     {/* Toggle Buttons */}
//     <div className="flex justify-center gap-4 mb-6">
//       <button
//         type="button"
//         onClick={() => setLoginType('company')}
//         className={`px-4 py-2 rounded ${
//           loginType === 'company'
//             ? 'bg-blue-600 text-white'
//             : 'bg-gray-200 text-gray-800'
//         }`}
//         disabled={loading}
//       >
//         Company
//       </button>
//       <button
//         type="button"
//         onClick={() => setLoginType('user')}
//         className={`px-4 py-2 rounded ${
//           loginType === 'user'
//             ? 'bg-blue-600 text-white'
//             : 'bg-gray-200 text-gray-800'
//         }`}
//         disabled={loading}
//       >
//         User
//       </button>
//     </div>

//     {/* Login Form */}
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {loginType === 'company' ? (
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//             Email
//           </label>
//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter your email"
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//             disabled={loading}
//           />
//         </div>
//       ) : (
//         <div>
//           <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//             Username
//           </label>
//           <input
//             id="username"
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="Enter your username"
//             className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//             disabled={loading}
//           />
//         </div>
//       )}

//       <div>
//         <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//           Password
//         </label>
//         <input
//           id="password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Enter your password"
//           className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//           disabled={loading}
//         />
//       </div>

//       <button
//         type="submit"
//         className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
//         disabled={loading}
//       >
//         {loading ? 'Logging in...' : `Login as ${loginType === 'company' ? 'Company' : 'User'}`}
//       </button>
//     </form>

//     {/* Redirect to register */}
//     <p className="mt-4 text-center text-sm text-gray-600">
//       Don't have an account?{' '}
//       <Link href="/register" className="text-blue-600 hover:underline font-medium">
//         Create an account
//       </Link>
//     </p>
//   </div>
// </div>

//   );
// };

// export default LoginPage;





/* app/login/page.tsx */
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type LoginType = 'company' | 'user';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('company');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Theme detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload =
      loginType === 'company'
        ? { type: 'company', email, password }
        : { type: 'user', username, password };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Login failed');
        return;
      }

      const data = await res.json();
      if (data.user?.status === 0) {
        toast.warning('Account inactive. Please contact support.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      router.replace(loginType === 'company' ? '/company' : '/user');
    } catch (err) {
      console.error(err);
      toast.error('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors`}>
      <ToastContainer position="top-center" />
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <div className="flex justify-center gap-4 mb-6">
          {(['company','user'] as LoginType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setLoginType(type)}
              disabled={loading}
              className={`px-4 py-2 rounded focus:outline-none focus:ring-2 ${
                loginType === type
                  ? 'bg-blue-600 text-white ring-blue-500'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 ring-gray-300 dark:ring-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* <form onSubmit={handleSubmit} className="space-y-4">
          {loginType === 'company' ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
                  className="mt-1 w-full px-3 py-2 border border-gray-700 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Logging in...' : `Login as ${loginType.charAt(0).toUpperCase() + loginType.slice(1)}`}
          </button>
        </form> */}

        <form onSubmit={handleSubmit} className="space-y-4">
  {loginType === 'company' ? (
    <div>
      <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        disabled={loading}
        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  ) : (
    <div>
      <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        disabled={loading}
        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )}

  <div>
    <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
    <input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Enter your password"
      disabled={loading}
      className="mt-1 w-full px-3 py-2 border border-gray-700 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {/* <div className="mt-1 text-sm text-right">
      <Link href="/forgot-password" className="text-blue-600 hover:underline">
        Forgot Password?
      </Link>
    </div> */}
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {loading ? 'Logging in...' : `Login as ${loginType.charAt(0).toUpperCase() + loginType.slice(1)}`}
  </button>
</form>


        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

























// "use client";

// import React, { useState, FormEvent, ChangeEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// type LoginType = 'company' | 'user';

// const LoginPage: React.FC = () => {
//   const router = useRouter();
//   const [loginType, setLoginType] = useState<LoginType>('company');
//   const [email, setEmail] = useState<string>('');
//   const [username, setUsername] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     // Determine API endpoint and payload
//     const endpoint = loginType === 'company' ? '/api/login' : '/api/login';
//     const payload: Record<string, any> = { password };
//     if (loginType === 'company') payload.email = email;
//     else payload.username = username;

//     try {
//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || 'Login failed');
//         setLoading(false);
//         return;
//       }

//       // Check account status
//       if (data.user && (data.user.status === 0 || data.user.status === false)) {
//         setError('Your account is inactive. Please contact support.');
//         setLoading(false);
//         return;
//       }

//       // Store token or user data
//       if (data.token) {
//         localStorage.setItem('token', data.token);
//       }
//       if (data.user) {
//         localStorage.setItem('user', JSON.stringify(data.user));
//       }

//       // Redirect based on login type
//       const path = loginType === 'company' ? '/company/dashboard' : '/user/dashboard';
//       router.push(path);
//     } catch (err: any) {
//       console.error('Login error:', err);
//       setError('An unexpected error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

//         <div className="flex justify-center gap-4 mb-6">
//           <button 
//             type="button"
//             onClick={() => setLoginType('company')}
//             className={`px-4 py-2 rounded ${loginType === 'company' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
//             disabled={loading}
//           >
//             Company
//           </button>
//           <button 
//             type="button"
//             onClick={() => setLoginType('user')}
//             className={`px-4 py-2 rounded ${loginType === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
//             disabled={loading}
//           >
//             User
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {loginType === 'company' ? (
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium">Email</label>
//               <input 
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//                 required
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={loading}
//               />
//             </div>
//           ) : (
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium">Username</label>
//               <input 
//                 id="username"
//                 type="text"
//                 value={username}
//                 onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
//                 placeholder="Enter your username"
//                 required
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 disabled={loading}
//               />
//             </div>
//           )}
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium">Password</label>
//             <input 
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               required
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               disabled={loading}
//             />
//           </div>
//           {error && (
//             <div className="text-red-500 text-sm">
//               {error}
//             </div>
//           )}
//           <button 
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
//           >
//             {loading ? 'Logging in...' : `Login as ${loginType === 'company' ? 'Company' : 'User'}`}
//           </button>
//         </form>

//         <p className="mt-4 text-center">
//           Don't have an account?{' '}
//           <Link href="/register" className="text-blue-600 hover:underline">
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


////////////////////////////////////working code but not like this ///////////////////////////////////////
// "use client";

// import React, { useState, FormEvent, ChangeEvent } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// type LoginType = 'company' | 'user';

// const LoginPage: React.FC = () => {
//   const router = useRouter();
//   const [loginType, setLoginType] = useState<LoginType>('company');
//   const [email, setEmail] = useState<string>('');       // For company login
//   const [username, setUsername] = useState<string>('');   // For user login
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError('');

//     // Prepare payload based on login type
//     const payload =
//       loginType === 'company'
//         ? { type: 'company', email, password }
//         : { type: 'user', username, password };

//     try {
//       const res = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
      
//       if (res.ok) {
//         // Extract user object from response
//         const { user } = await res.json();
//         localStorage.setItem('user', JSON.stringify(user));

//         // Redirect to the appropriate dashboard
//         if (loginType === 'company') {
//           router.push('/company');
//         } else {
//           router.push('/user');
//         }
//       } else {
//         const errorData = await res.json();
//         setError(errorData.error || 'Login failed');
//       }
//     } catch (err: any) {
//       console.error('Login error:', err);
//       setError('An unexpected error occurred');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

//         <div className="flex justify-center gap-4 mb-6">
//           <button 
//             type="button"
//             onClick={() => setLoginType('company')}
//             className={`px-4 py-2 rounded ${loginType === 'company' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
//           >
//             Company
//           </button>
//           <button 
//             type="button"
//             onClick={() => setLoginType('user')}
//             className={`px-4 py-2 rounded ${loginType === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
//           >
//             User
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {loginType === 'company' ? (
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium">Email</label>
//               <input 
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           ) : (
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium">Username</label>
//               <input 
//                 id="username"
//                 type="text"
//                 value={username}
//                 onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
//                 placeholder="Enter your username"
//                 className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           )}
//           <div>
//             <label htmlFor="password" className="block text-sm font-medium">Password</label>
//             <input 
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
//               placeholder="Enter your password"
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
//             Login as {loginType === 'company' ? 'Company' : 'User'}
//           </button>
//         </form>

//         <p className="mt-4 text-center">
//           Don't have an account?{' '}
//           <Link href="/register" className="text-blue-600 hover:underline">
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


