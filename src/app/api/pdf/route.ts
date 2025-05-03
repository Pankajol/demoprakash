// // app/api/pdf/route.ts
// import { NextResponse } from 'next/server'
// import puppeteer from 'puppeteer'

// export const runtime = 'nodejs' // ensure Node runtime

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url)
  
//   // e.g. allow overriding which URL to render:
//   const target = searchParams.get('url') ?? 'http://localhost:3000/*'

//   // launch headless Chrome
//   const browser = await puppeteer.launch({
//     args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   })
//   const page = await browser.newPage()

//   // go to your page and wait until all network calls finish
//   await page.goto(target, { waitUntil: 'networkidle0' })

//   // you can tweak page.pdf options for margins, format, header/footer, etc.
//   const pdfBuffer = await page.pdf({
//     format: 'A4',
//     printBackground: true,
//     margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
//   })

//   await browser.close()

//   // return the PDF buffer with a download header
//   return new NextResponse(pdfBuffer, {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': 'attachment; filename="report.pdf"',
      
//     },
//   })
// }



// app/api/pdf/route.ts
import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import cookie from 'cookie'          // npm install cookie

export const runtime = 'nodejs'

export async function GET(request: Request) {
  // 1) Read raw Cookie header
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookie.parse(cookieHeader)
  const token = cookies['token']    // token name must match your login cookie

  // 2) Launch Puppeteer
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()

  // 3) If token exists, inject it into the headless context
  if (token) {
    await page.setCookie({
      name:  'token',
      value: token,
      domain: 'localhost',    // adjust domain as needed in production
      path:   '/',
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
    })
  }

  // 4) Navigate to the protected page
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('url') || 'http://localhost:3000/company'
  await page.goto(target, { waitUntil: 'networkidle0' })

  // 5) Generate the PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  })
  await browser.close()

  // 6) Return as download
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    },
  })
}
