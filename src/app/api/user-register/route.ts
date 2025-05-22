"use server";

import { NextRequest, NextResponse } from "next/server";
import * as mssql from "mssql";          // ← note the `* as`
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import webpPool from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getCompanyIdFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Not authenticated");
  const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  const id = payload.id as number;
  if (!id) throw new Error("Company ID not found in token");
  return id;
}

export async function GET(request: NextRequest) {
  try {
    const companyID = await getCompanyIdFromToken(request);

    const pool = await webpPool;
    const result = await pool
      .request()
      .input("companyID", mssql.Int, companyID)
      .query(`
        SELECT
          u.UserID      AS id,
          u.Username    AS username,
          c.CompanyCode AS companyCode,
          u.Phone       AS phone,
          u.Status      AS status
        FROM dbo.tbl_Users u
        JOIN dbo.tbl_Companies c
          ON u.CompanyID = c.CompanyID
        WHERE u.CompanyID = @companyID
      `);

    return NextResponse.json({ users: result.recordset });
  } catch (error) {
    console.error("[API:user-register:GET] Fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    console.error("[API:user-register:POST] Invalid JSON:", error);
    return NextResponse.json({ error: "Invalid JSON body provided." }, { status: 400 });
  }

  const { username, phone, password, confirmPassword } = body;
  if (!username || !phone || !password || !confirmPassword) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { payload }: any = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const companyID = payload.id as number;
    const companyCode = payload.companyCode as string;

    if (!companyID || !companyCode) {
      return NextResponse.json({ error: "Invalid token payload." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const pool = await webpPool;
    await pool
      .request()
      .input("Username", mssql.NVarChar(255), username)
      .input("CompanyID", mssql.Int, companyID)
      .input("Phone", mssql.NVarChar(50), phone)
      .input("PasswordHash", mssql.NVarChar(255), passwordHash)
      .input("companyCode", mssql.NVarChar(50), companyCode)
      .query(`
        INSERT INTO dbo.tbl_Users
          (Username, CompanyID, Phone, PasswordHash, CreatedAt, UpdatedAt, Status, companyCode)
        VALUES
          (@Username, @CompanyID, @Phone, @PasswordHash, GETDATE(), GETDATE(), 1, @companyCode)
      `);

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("[API:user-register:POST] Registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed." }, { status: 500 });
  }
}


// "use server";

// import { NextRequest, NextResponse } from "next/server";
// import mssql from "mssql";
// import bcrypt from "bcryptjs";
// import { jwtVerify } from 'jose';
// import webpPool from '@/lib/db'; // Adjust path as needed

// const JWT_SECRET = process.env.JWT_SECRET!;

// /**
//  * Extracts and returns the companyID directly from the JWT payload
//  */
// async function getCompanyIdFromToken(req: NextRequest) {
//   const token = req.cookies.get('token')?.value;
//   if (!token) throw new Error('Not authenticated');
//   const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
//   const id = payload.id as number;
//   if (!id) throw new Error('Company ID not found in token');
//   return id;
// }

// /**
//  * GET /api/user-register
//  * Fetch all users scoped to the authenticated company
//  */
// export async function GET(request: NextRequest) {
//   try {
//     // 1) Get authenticated company ID from token
//     const companyID = await getCompanyIdFromToken(request);

//     // 2) Fetch users scoped to this company
//     const pool = await webpPool;
//     const result = await pool
//       .request()
//       .input('companyID', mssql.Int, companyID)
//       .query(`
//         SELECT
//           u.UserID      AS id,
//           u.Username    AS username,
//           c.CompanyCode AS companyCode,
//           u.Phone       AS phone,
//           u.Status      AS status
//         FROM dbo.tbl_Users u
//         JOIN dbo.tbl_Companies c
//           ON u.CompanyID = c.CompanyID
//         WHERE u.CompanyID = @companyID
//       `);

//     return NextResponse.json({ users: result.recordset });
//   } catch (error) {
//     console.error("[API:user-register:GET] Fetch users error:", error);
//     return NextResponse.json({ error: "Failed to fetch users." }, { status: 500 });
//   }
// }

// /**
//  * POST /api/user-register
//  * Register a new user under the authenticated company: hash password and insert record
//  */
// export async function POST(request: NextRequest) {
//   let body: any;
//   try {
//     body = await request.json();
//   } catch (error) {
//     console.error("[API:user-register:POST] Invalid JSON:", error);
//     return NextResponse.json({ error: "Invalid JSON body provided." }, { status: 400 });
//   }

//   const { username, phone, password, confirmPassword } = body;
//   if (!username || !phone || !password || !confirmPassword) {
//     return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
//   }
//   if (password !== confirmPassword) {
//     return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
//   }

//   try {
    
//     const token = request.cookies.get('token')?.value;
//     if (!token) {
//       return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
//     }

//     const { payload }: any = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
//     const companyID = payload.id;
//     const companyCode = payload.companyCode;

//     if (!companyID || !companyCode) {
//       return NextResponse.json({ error: "Invalid token payload." }, { status: 400 });
//     }




//     // 1) Decode token to get CompanyID
//     // const companyID = await getCompanyIdFromToken(request);

//     // 2) Hash password
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);



//     // 3) Insert user record under this company
//     const pool = await webpPool;
//     await pool
//       .request()
//       .input("Username", mssql.NVarChar(255), username)
//       .input("CompanyID", mssql.Int, companyID)
//       .input("Phone", mssql.NVarChar(50), phone)
//       .input("PasswordHash", mssql.NVarChar(255), passwordHash)
//       .input("companyCode", mssql.NVarChar(50), payload.companyCode)
//       .query(
//         `INSERT INTO dbo.tbl_Users
//            (Username, CompanyID, Phone, PasswordHash, CreatedAt, UpdatedAt, Status,companyCode)
//          VALUES
//            (@Username, @CompanyID, @Phone, @PasswordHash, GETDATE(), GETDATE(), 1,@companyCode)`
//       );

//     return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
//   } catch (error: any) {
//     console.error("[API:user-register:POST] Registration error:", error);
//     return NextResponse.json({ error: error.message || "Registration failed." }, { status: 500 });
//   }
// }





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
