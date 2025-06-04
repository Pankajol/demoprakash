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


