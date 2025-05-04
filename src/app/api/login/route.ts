
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import webpPool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { type, email, password, username } = await req.json();
    const pool = await webpPool;

    // COMPANY LOGIN FLOW
    if (type === 'company') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
      }

      const result = await pool.request()
        .input('email', email)
        .query(`
          SELECT CompanyID, CompanyName, CompanyCode, PasswordHash, Status
          FROM dbo.tbl_Companies
          WHERE Email = @email
        `);

      const company = result.recordset[0];
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(password, company.PasswordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
      if (company.Status !== true && company.Status !== 1) {
        return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
      }

      const payload = {
        type: 'company',
        id: company.CompanyID,
        companyCode: company.CompanyCode,
      };

      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(JWT_SECRET));

      const safeCompany = {
        id: company.CompanyID,
        companyName: company.CompanyName,
        companyCode: company.CompanyCode,
        status: company.Status,
      };

      const res = NextResponse.json(
        { message: 'Company login successful', user: safeCompany },
        { status: 200 }
      );
      res.cookies.set('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      });
      return res;
    }

    // USER LOGIN FLOW (independent)
    if (type === 'user') {
      if (!username || !password) {
        return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
      }

      const result = await pool.request()
        .input('username', username)
        .query(`
          SELECT UserID, Username, PasswordHash, Status, CompanyCode
          FROM dbo.tbl_Users
          WHERE Username = @username
        `);

      const user = result.recordset[0];
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(password, user.PasswordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }
      if (user.Status !== true && user.Status !== 1) {
        return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
      }

      const payload = {
        type: 'user',
        id: user.UserID,
        username: user.Username,
        companyCode: user.CompanyCode,
      };

      const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(new TextEncoder().encode(JWT_SECRET));

      const safeUser = {
        id: user.UserID,
        username: user.Username,
        companyCode: user.CompanyCode,
        status: user.Status,
      };

      const res = NextResponse.json(
        { message: 'User login successful', user: safeUser },
        { status: 200 }
      );
      res.cookies.set('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 3600,
      });
      return res;
    }

    // Invalid type
    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });

  } catch (err: any) {
    console.error('[LOGIN_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




// "use server";

// import { NextRequest, NextResponse } from 'next/server';
// import { SignJWT } from 'jose';
// import bcrypt from 'bcryptjs';
// import webpPool from '@/lib/db';

// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function POST(req: NextRequest) {
//   try {
//     const { type, email, password, username } = await req.json();
//     const pool = await webpPool;

//     let userData: any;

//     // 1) Fetch user or company record
//     if (type === 'company') {
//       if (!email || !password) {
//         return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
//       }
//       const result = await pool.request()
//         .input('email', email)
//         .query(
//           `SELECT CompanyID, CompanyName, CompanyCode, PasswordHash, Status
//            FROM dbo.tbl_Companies
//            WHERE Email = @email`
//         );
//       userData = result.recordset[0];
//     } else if (type === 'user') {
//       if (!username || !password) {
//         return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
//       }
//       const result = await pool.request()
//         .input('username', username)
//         .query(
//           `SELECT UserID, Username, PasswordHash, Status
//            FROM dbo.tbl_Users
//            WHERE Username = @username`
//         );
//       userData = result.recordset[0];
//     } else {
//       return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
//     }

//     if (!userData) {
//       return NextResponse.json({ error: 'Account not found' }, { status: 404 });
//     }

//     // 2) Verify password
//     const isMatch = await bcrypt.compare(password, userData.PasswordHash);
//     if (!isMatch) {
//       return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
//     }

//     // 3) Check if account is active
//     if (userData.Status !== true && userData.Status !== 1) {
//       return NextResponse.json({ error: 'Your account is inactive. Please contact support.' }, { status: 403 });
//     }

//     // 4) Issue JWT with companyCode for companies
//     const payload: Record<string, any> = {
//       type,
//       id: userData.CompanyID ?? userData.UserID,
//     };
//     if (type === 'company') payload.companyCode = userData.CompanyCode;

//     const secret = new TextEncoder().encode(JWT_SECRET);
//     const token = await new SignJWT(payload)
//       .setProtectedHeader({ alg: 'HS256' })
//       .setExpirationTime('1h')
//       .sign(secret);

//     // 5) Build a safe payload to return (omit sensitive fields)
//     let safeUser: Record<string, any>;
//     if (type === 'company') {
//       safeUser = {
//         id: userData.CompanyID,
//         companyName: userData.CompanyName,
//         companyCode: userData.CompanyCode,
//         status: userData.Status,
//       };
//     } else {
//       safeUser = {
//         id: userData.UserID,
//         username: userData.Username,
//         status: userData.Status,
//       };
//     }

//     // 6) Return user data + set token cookie
//     const response = NextResponse.json(
//       { message: 'Login successful', user: safeUser },
//       { status: 200 }
//     );
//     response.cookies.set('token', token, {
//       httpOnly: true,
//       path: '/',
//       maxAge: 60 * 60, // 1 hour
//     });

//     return response;
//   } catch (err: any) {
//     console.error('[LOGIN_ERROR]', err);
//     return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
//   }
// }



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
