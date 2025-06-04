
import { NextRequest, NextResponse } from "next/server";
import * as sql from "mssql";
import { jwtVerify } from 'jose';
//import poolPromise from "@/lib/lb";   // Connection pool to pPlus DB
import { clientConfigs } from '../connect-local/route';
import webpPool from "@/lib/db";     // Connection pool to WebpPlus DB

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper: extract company code from JWT
async function getCompanyCode(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) throw new Error('Not authenticated');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  const companyCode = payload.companyCode as string;
  if (!companyCode) throw new Error('Company code missing in token');
  return payload.companyCode as string;
}

// async function getSubject(req: NextRequest) {
//   const token = req.cookies.get('token')?.value;
//   if (!token) throw new Error('Not authenticated');
//   const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
//   return payload.sub as string;
// }

export async function POST(req: NextRequest) {
  const { yearIds }: { yearIds: number[] } = await req.json();
  const validIds = yearIds.map(y => Number(y)).filter(Number.isInteger);
  if (!validIds.length) {
    return NextResponse.json({ error: 'No valid YearId provided.' }, { status: 400 });
  }

  // let subject: string;
  // try {
  //   subject = await getSubject(req);
  // } catch (e: any) {
  //   return NextResponse.json({ error: e.message }, { status: 401 });
  // }
  const companyCode = await getCompanyCode(req);
  const localConfig = clientConfigs[companyCode];
  if (!localConfig) {
    return NextResponse.json({ error: 'No local DB connected; please re-connect.' }, { status: 400 });
  }
  try {
    // 1) Get companyCode
    const companyCode = await getCompanyCode(req);

    // 2) Get DB pools
    const poolPPlus = await sql.connect({ ...localConfig, options:{encrypt:false,trustServerCertificate:true} });
    // const poolPPlus = await poolPromise;
    const poolWebpPlus = await webpPool;

    // 3) Call SP for each year (pass companyCode if supported)
    const allRows: any[] = [];
    for (const year of validIds) {
      const spReq = poolPPlus.request()
        .input('YrId', sql.VarChar(225), String(year))
        // .input('CompanyCode', sql.VarChar(50), companyCode);
      const spRes = await spReq.execute('sp_AllYear_Find_DailyTrans');
      allRows.push(...(spRes.recordset ?? []));
    }

    // 4) Filter rows matching this companyCode
    const matchedRows = allRows.filter(r => String(r.WebpCompanyId) === companyCode);
    console.log(`Rows matched for company ${companyCode}: ${matchedRows.length}`);

    // 5) Delete existing rows for matched YearIds and company
    if (matchedRows.length) {
      const yearList = Array.from(new Set(matchedRows.map(r => r.YearId)));
      const delReq = poolWebpPlus.request();
      delReq.input('companyCode', sql.VarChar(50), companyCode);
      yearList.forEach((id, i) => delReq.input(`id${i}`, sql.Int, id));
      await delReq.query(
        `DELETE FROM dbo.DailyTransImport
         WHERE YearId IN (${yearList.map((_, i) => `@id${i}`).join(',')})
           AND companyCode = @companyCode`
      );
    }

    // 6) Prepare TVP for bulk insert
    const tvp = new sql.Table('dbo.DailyTransImport');
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
    tvp.columns.add("companyCode", sql.VarChar(50));
   
    tvp.columns.add('DrTypeId',     sql.Int);
    tvp.columns.add('CrTypeId',     sql.Int);

    // 7) Load only matchedRows into TVP
    const safeString = (v: any) => typeof v === 'string' ? v : v != null ? String(v) : '';
    matchedRows.forEach(r => {
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
        companyCode,
        r.drTypeid ?? null,
        r.crtypeId ?? null
      );
    });

    // 8) Bulk insert matchedRows
    if (matchedRows.length) {
      await poolWebpPlus.request().bulk(tvp);
      console.log('Bulk insert completed for company:', companyCode);
    } else {
      console.log('No matched rows to insert for company:', companyCode);
    }

    // 9) Respond with count of matchedRows
    return NextResponse.json({ imported: matchedRows.length, sample: matchedRows.slice(0, 5) });

  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}





