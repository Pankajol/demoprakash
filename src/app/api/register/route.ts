'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mssql from 'mssql';
import webpPool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type } = data; // 'company' or 'user'
    const pool = await webpPool;

    if (type === 'company') {
      const { companyName, email, phone, gstNo, password, confirmPassword } = data;

      // Basic validation
      if (!companyName || !email || !password || !confirmPassword) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 1) Insert the company & get back the new numeric ID
      const insertSql = `
        INSERT INTO dbo.tbl_Companies
          (CompanyName, Email, Phone, GSTNo, PasswordHash)
        OUTPUT inserted.CompanyID
        VALUES
          (@cn, @em, @ph, @gst, @phash);
      `;
      const insertResult = await pool.request()
        .input('cn',    mssql.NVarChar(255), companyName)
        .input('em',    mssql.NVarChar(255), email)
        .input('ph',    mssql.NVarChar(50),  phone)
        .input('gst',   mssql.NVarChar(50),  gstNo)
        .input('phash', mssql.NVarChar(255), passwordHash)
        .query(insertSql);

      const newCompanyID = insertResult.recordset[0].CompanyID;
      // 2) Generate the CompanyCode: comp + zero-padded 4-digit ID
      const companyCode = 'comp' + String(newCompanyID).padStart(4, '0');

      // 3) Update the newly inserted row with CompanyCode
      const updateSql = `
        UPDATE dbo.tbl_Companies
        SET CompanyCode = @code
        WHERE CompanyID = @id
      `;
      await pool.request()
        .input('code', mssql.NVarChar(20), companyCode)
        .input('id',   mssql.Int,          newCompanyID)
        .query(updateSql);

      // 4) Return success, new ID and code
      return NextResponse.json({
        message:      'Company registration successful',
        companyID:    newCompanyID,
        companyCode:  companyCode
      }, { status: 201 });

    } else if (type === 'user') {
      const { username, companyID, phone, password, confirmPassword } = data;

      // Basic validation
      if (!username || companyID == null || !password || !confirmPassword) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
      }

      // Verify company exists
      const checkCompany = `
        SELECT TOP 1 CompanyID
        FROM dbo.tbl_Companies
        WHERE CompanyID = @companyID
      `;
      const companyCheck = await pool.request()
        .input('companyID', mssql.Int, companyID)
        .query(checkCompany);

      if (companyCheck.recordset.length === 0) {
        return NextResponse.json({ error: 'Invalid CompanyID.' }, { status: 400 });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Insert into Users
      const insertUser = `
        INSERT INTO dbo.tbl_Users
          (Username, CompanyID, Phone, PasswordHash)
        VALUES
          (@username, @companyID, @phone, @passwordHash)
      `;
      await pool.request()
        .input('username',     mssql.NVarChar(255), username)
        .input('companyID',    mssql.Int,            companyID)
        .input('phone',        mssql.NVarChar(50),   phone)
        .input('passwordHash', mssql.NVarChar(255),  passwordHash)
        .query(insertUser);

      return NextResponse.json({ message: 'User registration successful' }, { status: 201 });

    } else {
      return NextResponse.json({ error: 'Invalid registration type.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}


