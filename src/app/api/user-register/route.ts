"use server";

import { NextResponse } from "next/server";
import mssql from "mssql";
import bcrypt from "bcryptjs";
import webpPool from "@/lib/db"; // Adjust path as needed

/**
 * GET /api/user-register
 * Fetch all users with id, username, companyID, phone, and status
 */
export async function GET() {
  try {
    const pool = await webpPool;
    const result = await pool
      .request()
      .query(`
        SELECT
          UserID   AS id,
          Username AS username,
          CompanyID AS companyID,
          Phone    AS phone,
          Status   AS status
        FROM [dbo].[tbl_Users]
      `);

    return NextResponse.json({ users: result.recordset });
  } catch (error) {
    console.error("[API:user-register:GET] Fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

/**
 * POST /api/user-register
 * Register a new user: hash password and insert record
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[API:user-register:POST] Invalid JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body provided." }, { status: 400 });
  }

  const { username, companyID, phone, password, confirmPassword } = body;
  if (!username || !companyID || !password || !confirmPassword) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const pool = await webpPool;
    await pool
      .request()
      .input("Username", mssql.NVarChar(255), username)
      .input("CompanyID", mssql.Int, Number(companyID))
      .input("Phone", mssql.NVarChar(50), phone)
      .input("PasswordHash", mssql.NVarChar(255), passwordHash)
      .query(
        `INSERT INTO [dbo].[tbl_Users]
           (Username, CompanyID, Phone, PasswordHash, CreatedAt, UpdatedAt, Status)
         VALUES
           (@Username, @CompanyID, @Phone, @PasswordHash, GETDATE(), GETDATE(), 1)`
      );

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("[API:user-register:POST] Registration error:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}





// "use server";

// import { NextResponse } from "next/server";
// import mssql from "mssql";
// import bcrypt from "bcryptjs";
// import  webpPool  from "@/lib/db"; // Adjust path as needed



// export async function GET() {
//   try {
//     const pool = await webpPool;
//     const result = await pool
//       .request()
//       .query(`
//         SELECT
//           id,
//           Username AS username,
//           CompanyID AS companyID,
//           Phone AS phone,
//           status,
//         FROM tbl_Users
//       `);
//     return NextResponse.json({ users: result.recordset });
//   } catch (error) {
//     console.error("Fetch users error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch users." },
//       { status: 500 }
//     );
//   }
// }


// export async function POST(request: Request) {
//   let body: any;
//   try {
//     // Parse the incoming JSON body
//     body = await request.json();
//   } catch (error) {
//     console.error("Error parsing JSON body:", error);
//     return NextResponse.json({ error: "Invalid JSON body provided." }, { status: 400 });
//   }

//   // Destructure expected fields
//   const { username, companyID, phone, password, confirmPassword } = body;

//   // Basic validation
//   if (!username || !companyID || !password || !confirmPassword) {
//     return NextResponse.json(
//       { error: "Missing required fields." },
//       { status: 400 }
//     );
//   }

//   if (password !== confirmPassword) {
//     return NextResponse.json(
//       { error: "Passwords do not match." },
//       { status: 400 }
//     );
//   }

//   try {
//     // Hash the password using bcryptjs
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     // Get the existing connection pool from db.ts
//     const pool = await webpPool;

//     // Insert the new user using parameterized query
//     await pool
//       .request()
//       .input("Username", mssql.NVarChar(255), username)
//       .input("CompanyID", mssql.Int, companyID) // Use NVarChar(36) for UUIDs. Adjust if type differs.
//       .input("Phone", mssql.NVarChar(50), phone)
//       .input("PasswordHash", mssql.NVarChar(255), passwordHash)
//       .query(`
//         INSERT INTO tbl_Users (Username, CompanyID, Phone, PasswordHash)
//         VALUES (@Username, @CompanyID, @Phone, @PasswordHash)
//       `);

//     return NextResponse.json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return NextResponse.json({ error: "Registration failed" }, { status: 500 });
//   }
// }




// "use server";

// import { NextResponse } from "next/server";
// import mssql from "mssql";
// import bcrypt from "bcryptjs";
// import  webpPool  from "@/lib/db"; // adjust the path according to your project structure

// export async function POST(request: Request) {
//   try {
//     const { username, companyID, phone, password, confirmPassword } = await request.json();

//     // Validate that the provided passwords match.
//     if (password !== confirmPassword) {
//       return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
//     }

//     // Hash the password using bcryptjs.
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     // Reuse the connection pool from db.ts
//     const pool = await webpPool;

//     // Use a parameterized query to prevent SQL injection.
//     await pool.request()
//       .input('Username', mssql.VarChar(255), username)
//       .input('CompanyID', mssql.VarChar(36), companyID) // Assuming CompanyID is a VARCHAR(36)
//       .input('Phone', mssql.VarChar(50), phone)
//       .input('PasswordHash', mssql.VarChar(255), passwordHash)
//       .query(`
//         INSERT INTO Users (Username, CompanyID, Phone, PasswordHash)
//         VALUES (@Username, @CompanyID, @Phone, @PasswordHash)
//       `);

//     return NextResponse.json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Registration error:", error);
//     return NextResponse.json({ error: "Registration failed" }, { status: 500 });
//   }
// }
