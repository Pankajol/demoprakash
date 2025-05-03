"use server";

import { NextResponse } from "next/server";
import mssql from "mssql";
import bcrypt from "bcryptjs";
import webpPool from "@/lib/db";

/**
 * PUT /api/user-update/:id
 * Updates a user's details (username, companyID, phone, optional password)
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // await params to comply with Next.js 15 async dynamic API requirement
  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    console.error("[API:user-update:PUT] Invalid JSON:", err);
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { username, companyID, phone, password, confirmPassword } = body;
  if (!username || !companyID || !phone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if ((password != null || confirmPassword != null) && password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
  }

  try {
    const pool = await webpPool;
    const req = pool.request()
      .input("UserID", mssql.Int, Number(id))
      .input("Username", mssql.NVarChar(255), username)
      .input("CompanyID", mssql.Int, Number(companyID))
      .input("Phone", mssql.NVarChar(50), phone);

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      req.input("PasswordHash", mssql.NVarChar(255), passwordHash);
    }

    await req.query(
      `UPDATE [dbo].[tbl_Users]
       SET Username     = @Username,
           CompanyID    = @CompanyID,
           Phone        = @Phone,${password ? `
           PasswordHash = @PasswordHash,` : ""}
           UpdatedAt    = GETDATE()
       WHERE UserID = @UserID`
    );

    return NextResponse.json({ message: "User updated successfully." });
  } catch (err) {
    console.error("[API:user-update:PUT] Update failed:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

/**
 * PATCH /api/user-update/:id
 * Toggles a user's status (active/inactive)
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  // await params to comply with Next.js 15 async dynamic API requirement
  const { id } = await params;
  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    console.error("[API:user-update:PATCH] Invalid JSON:", err);
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { status } = body;
  if (status == null) {
    return NextResponse.json({ error: "Missing status field." }, { status: 400 });
  }

  try {
    const pool = await webpPool;
    await pool.request()
      .input("UserID", mssql.Int, Number(id))
      // omit explicit type for status to let driver infer BIT from boolean
      .input("Status", Boolean(status))
      .query(
        `UPDATE [dbo].[tbl_Users]
         SET Status    = @Status,
             UpdatedAt = GETDATE()
         WHERE UserID = @UserID`
      );

    return NextResponse.json({ message: "Status updated successfully." });
  } catch (err) {
    console.error("[API:user-update:PATCH] Status update error:", err);
    return NextResponse.json({ error: "Status update failed." }, { status: 500 });
  }
}
