import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import webpPool from '@/lib/db';
import { jwtVerify } from 'jose';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);
    const companyId = payload.id;

    if (!companyId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 });
    }

    const { oldPassword, newPassword } = await req.json();

    const pool = await webpPool;

    const userQuery = `
      SELECT PasswordHash FROM [dbo].[tbl_Companies] WHERE CompanyID = @CompanyID
    `;
       const PassforuserQuery = `
      SELECT PasswordHash FROM [dbo].[tbl_Users] WHERE CompanyID = @CompanyID
    `;
    const userResult = await pool
      .request()
      .input('CompanyID', companyId)
      .query(userQuery);

    const user = userResult.recordset[0];

    if (!user) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Old password is incorrect' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `
      UPDATE [dbo].[tbl_Companies]
      SET PasswordHash = @Password
      WHERE CompanyID = @CompanyID
    `;
    await pool
      .request()
      .input('Password', hashedPassword)
      .input('CompanyID', companyId)
      .query(updateQuery);

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
