


import { NextRequest, NextResponse } from "next/server";
import * as sql from "mssql";              // ← Use a namespace import
import poolPromise from "@/lib/lb";         // Connection pool to pPlus DB
import webpPool from "@/lib/db";           // Connection pool to WebpPlus DB

export async function POST(req: NextRequest) {
  const { yearIds }: { yearIds: number[] } = await req.json();

  // ensure every element is a valid integer
  const validIds = yearIds
    .map((y) => Number(y))
    .filter((y) => Number.isInteger(y));

  if (!validIds.length) {
    return NextResponse.json(
      { error: 'No valid YearId provided.' },
      { status: 400 }
    );
  }

  // 2) join into tight CSV: "8,9,10,11" or "11"
  const csvYears = validIds.join(',');
  let poolPPlus: sql.ConnectionPool;
  let poolWebpPlus: sql.ConnectionPool;

  try {

    poolPPlus     = await poolPromise;
    poolWebpPlus  = await webpPool;

    // 2) For each year, call the SP and accumulate rows
    const allRows: any[] = [];
    for (const year of validIds) {
      const spReq = poolPPlus.request()
        .input('YrId', sql.VarChar(225), String(year));
      const spRes = await spReq.execute('sp_AllYear_Find_DailyTrans');
      allRows.push(...(spRes.recordset ?? []));
    }

    console.log(`Fetched a total of ${allRows.length} rows for years: [${validIds.join(',')}]`);
    // // 1) Get connections
    // poolPPlus   = await poolPromise;
    // poolWebpPlus = await webpPool;

    // // 2) Execute stored procedure in pPlus DB
    // const spReq = poolPPlus
    // .request()
    // .input('YrId', sql.VarChar(225), csvYears);
    // const sp   = await spReq.execute("sp_AllYear_Find_DailyTrans");
    // const rows = sp.recordset ?? [];

    // console.log("Stored Procedure Response:", rows);

    // 3) Delete existing rows from WebpPlus DB
    if (allRows.length) {
      const yearIds = Array.from(new Set(allRows.map(r => r.YearId)));
      const deleteRequest = poolWebpPlus.request();

      yearIds.forEach((id, idx) =>
        deleteRequest.input(`id${idx}`, sql.Int, id)
      );

      await deleteRequest.query(
        `DELETE FROM dbo.DailyTransImport
         WHERE YearId IN (${yearIds.map((_, idx) => `@id${idx}`).join(",")})`
      );
    }

    // 4) Prepare TVP for bulk insert
    const tvp = new sql.Table("dbo.DailyTransImport");
    tvp.create = false;
    tvp.columns.add("MyType",        sql.VarChar(10));
    tvp.columns.add("VNo",           sql.VarChar(50));
    tvp.columns.add("ItemNo",        sql.Int);
    tvp.columns.add("UsrDate",       sql.DateTime);
    tvp.columns.add("PartyCode",     sql.VarChar(50));
    tvp.columns.add("Party",         sql.VarChar(200));
    tvp.columns.add("CityArea",      sql.VarChar(200));
    tvp.columns.add("VAmt",          sql.Decimal(18, 2));
    tvp.columns.add("AdjAmt",        sql.Decimal(18, 2));
    tvp.columns.add("AdjIds",        sql.VarChar(sql.MAX));
    tvp.columns.add("Trading",       sql.Int);
    tvp.columns.add("TradingLed",    sql.VarChar(200));
    tvp.columns.add("YearId",        sql.Int);
    tvp.columns.add("UsrName",       sql.VarChar(100));
    tvp.columns.add("EditMode",      sql.VarChar(10));
    tvp.columns.add("EditUpdate",    sql.DateTime);
    tvp.columns.add("CDF",           sql.Char(1));
    tvp.columns.add("WebpCompanyId", sql.VarChar(50));
    tvp.columns.add("DrTypeId", sql.Int);
  tvp.columns.add("CrTypeId", sql.Int);

    // 5) Load rows into the TVP
    const safeString = (val: any) =>
      typeof val === "string" ? val : val != null ? String(val) : "";

    allRows.forEach(r => {
      const drType = r.drTypeid  ?? null;
      const crType = r.crtypeId  ?? null;
      tvp.rows.add(

        safeString(r.MyType),
        safeString(r.VNo),
        r.ItemNo       ?? null,
        r.UsrDate      ?? null,
        safeString(r.PartyCode),
        safeString(r.Party),
        safeString(r.CityArea),
        r.VAmt         ?? null,
        r.AdjAmt       ?? null,
        safeString(r.AdjIds),
        r.Trading      ?? null,
        safeString(r.TradingLed),
        r.YearId       ?? null,
        safeString(r.UsrName),
        safeString(r.EditMode),
        r.EditUpdate   ?? null,
        safeString(r.CDF),
        safeString(r.WebpCompanyId),
        drType,         // ← use r.drTypeid
        crType          // ← use r.crtypeId
      );
    });

    // 6) Bulk insert to WebpPlus DB
    if (allRows.length) {
      await poolWebpPlus.request().bulk(tvp);
      console.log("Bulk insert completed successfully into WebpPlus.");
    } else {
      console.log("No rows to insert.");
    }

    // 7) Final Response
    return NextResponse.json({
      imported: allRows.length,
      storedProcedureSample: allRows.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
