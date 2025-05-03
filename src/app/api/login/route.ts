'use server';

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import webpPool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  const { type, email, password, username } = await req.json();
  const pool = await webpPool;

  let userData: any;

  // 1) Fetch user or company record
  if (type === 'company') {
    const result = await pool.request()
      .input('email', email)
      .query(`SELECT CompanyID, CompanyName, PasswordHash, Status FROM dbo.tbl_Companies WHERE Email = @email`);
    userData = result.recordset[0];
  } else if (type === 'user') {
    const result = await pool.request()
      .input('username', username)
      .query(`SELECT UserID, Username, PasswordHash, Status FROM dbo.tbl_Users WHERE Username = @username`);
    userData = result.recordset[0];
  } else {
    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
  }

  if (!userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  console.log("User data:", userData);  // Debugging line

  // 2) Verify password
  const hashed = userData.PasswordHash || userData.Password;
  const isMatch = await bcrypt.compare(password, hashed);
  if (!isMatch) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  // 3) Check if user is active
  if (userData.Status !== true) {  // Change this check to check for true, not 1
    return NextResponse.json({ error: 'Your account is inactive. Please contact support.' }, { status: 403 });
  }

  // 4) Issue JWT
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ type, id: userData.CompanyID ?? userData.UserID })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);

  // 5) Build a safe payload to return (omit password hash)
  let safeUser: Record<string, any>;
  if (type === 'company') {
    safeUser = {
      id: userData.CompanyID,
      companyName: userData.CompanyName,
      status: userData.Status,
    };
  } else {
    safeUser = {
      id: userData.UserID,
      username: userData.Username,
      status: userData.Status,
    };
  }

  // 6) Return user data + set token cookie
  const response = NextResponse.json(
    { message: 'Login successful', user: safeUser },
    { status: 200 }
  );
  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}


// 'use server';

// import { NextRequest, NextResponse } from 'next/server';
// import { SignJWT } from 'jose';
// import bcrypt from 'bcryptjs';
// import webpPool from '@/lib/db';
// import { stat } from 'fs';

// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function POST(req: NextRequest) {
//   const { type, email, password, username } = await req.json();
//   const pool = await webpPool;

//   let userData: any;

//   // 1) Fetch user or company record
//   if (type === 'company') {
//     const result = await pool.request()
//       .input('email', email)
//       .query(`SELECT CompanyID, CompanyName,  PasswordHash FROM dbo.tbl_Companies WHERE Email = @email`);
//     userData = result.recordset[0];
//   } else if (type === 'user') {
//     const result = await pool.request()
//       .input('username', username)
//       .query(`SELECT UserID, Username,  PasswordHash FROM dbo.tbl_Users WHERE Username = @username`);
//     userData = result.recordset[0];
//   } else {
//     return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
//   }

//   if (!userData) {
//     return NextResponse.json({ error: 'User not found' }, { status: 404 });
//   }

//   // 2) Verify password
//   const hashed = userData.PasswordHash || userData.Password;
//   const isMatch = await bcrypt.compare(password, hashed);
//   if (!isMatch) {
//     return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
//   }

//   // 3) Issue JWT
//   const secret = new TextEncoder().encode(JWT_SECRET);
//   const token = await new SignJWT({ type, id: userData.CompanyID ?? userData.UserID })
//     .setProtectedHeader({ alg: 'HS256' })
//     .setExpirationTime('1h')
//     .sign(secret);

//   // 4) Build a safe payload to return (omit password hash)
//   let safeUser: Record<string, any>;
//   if (type === 'company') {
//     safeUser = {
//       id: userData.CompanyID,
//       companyName: userData.CompanyName,
//       // companyLogo: userData.LogoUrl,
//     };
//   } else {
//     safeUser = {
//       id: userData.UserID,
//       username: userData.Username,
//       status: userData.Status,
//       // avatarUrl: userData.AvatarUrl,
//     };
//   }

//   // 5) Return user data + set token cookie
//   const response = NextResponse.json(
//     { message: 'Login successful', user: safeUser },
//     { status: 200 }
//   );
//   response.cookies.set('token', token, {
//     httpOnly: true,
//     path: '/',
//     maxAge: 60 * 60, // 1 hour
//   });

//   return response;
// }
