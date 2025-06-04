
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



