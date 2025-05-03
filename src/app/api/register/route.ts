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

      // Insert into Companies
      const insertCompany = `
        INSERT INTO [dbo].[tbl_Companies]
          (CompanyName, Email, Phone, GSTNo, PasswordHash)
        VALUES
          (@companyName, @email, @phone, @gstNo, @passwordHash);
        SELECT SCOPE_IDENTITY() AS CompanyID;
      `;
      const companyResult = await pool.request()
        .input('companyName', mssql.NVarChar(255), companyName)
        .input('email',       mssql.NVarChar(255), email)
        .input('phone',       mssql.NVarChar(50),  phone)
        .input('gstNo',       mssql.NVarChar(50),  gstNo)
        .input('passwordHash',mssql.NVarChar(255), passwordHash)
        .query(insertCompany);

      const newCompanyID = companyResult.recordset[0]?.CompanyID;
      return NextResponse.json({
        message: 'Company registration successful',
        companyID: newCompanyID,
      });

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
        FROM [dbo].[tbl_Companies]
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
        INSERT INTO [dbo].[tbl_Users]
          (Username, CompanyID, Phone, PasswordHash)
        VALUES
          (@username, @companyID, @phone, @passwordHash)
      `;
      await pool.request()
        .input('username',     mssql.NVarChar(255), passwordHash /* fix: input order wrong? */)
        .input('companyID',    mssql.Int,            companyID)
        .input('phone',        mssql.NVarChar(50),   phone)
        .input('passwordHash', mssql.NVarChar(255),  passwordHash)
        .query(insertUser);

      return NextResponse.json({ message: 'User registration successful' });

    } else {
      return NextResponse.json({ error: 'Invalid registration type.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




// import { NextRequest, NextResponse } from 'next/server';
// import bcrypt from "bcryptjs";
// import webpPool from '@/lib/db';

// export async function POST(req: NextRequest) {
//   try {
//     const data = await req.json();
//     const { type } = data; // 'company' or 'user'
    
//     const pool = await webpPool;

//     if (type === 'company') {
//       const { companyName, email, phone, gstNo, password, confirmPassword } = data;
//       // Insert company data into tbl_Companies and return the new CompanyID.
//       const query = `
//         INSERT INTO [dbo].[tbl_Companies] 
//           (CompanyName, Email, Phone, GSTNo, Password, ConfirmPassword)
//         VALUES 
//           (@companyName, @email, @phone, @gstNo, @password, @confirmPassword);
//         SELECT SCOPE_IDENTITY() AS CompanyID;
//       `;
//       const result = await pool.request()
//         .input('companyName', companyName)
//         .input('email', email)
//         .input('phone', phone)
//         .input('gstNo', gstNo)
//         .input('password', password)
//         .input('confirmPassword', confirmPassword)
//         .query(query);

//       return NextResponse.json({
//         message: 'Company registration successful',
//         companyID: result.recordset[0].CompanyID,
//       });
//     } else if (type === 'user') {
//       const { username, companyID, phone, password, confirmPassword } = data;
      
//       // Check if the provided companyID exists
//       const checkQuery = `
//         SELECT * FROM [dbo].[tbl_Companies]
//         WHERE CompanyID = @companyID
//       `;
//       const companyResult = await pool.request()
//         .input('companyID', companyID)
//         .query(checkQuery);

//       if (companyResult.recordset.length === 0) {
//         return NextResponse.json({ error: 'Invalid Company ID' }, { status: 400 });
//       }
      
//       // Insert user data into tbl_Users.
//       const insertQuery = `
//         INSERT INTO [dbo].[tbl_Users]
//           (Username, CompanyID, Phone, Password, ConfirmPassword)
//         VALUES 
//           (@username, @companyID, @phone, @password, @confirmPassword)
//       `;
//       await pool.request()
//         .input('username', username)
//         .input('companyID', companyID)
//         .input('phone', phone)
//         .input('password', password)
//         .input('confirmPassword', confirmPassword)
//         .query(insertQuery);

//       return NextResponse.json({ message: 'User registration successful' });
//     } else {
//       return NextResponse.json({ error: 'Invalid registration type' }, { status: 400 });
//     }
//   } catch (error: any) {
//     console.error('Registration error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


