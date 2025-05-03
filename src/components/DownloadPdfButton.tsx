'use client'

import React from 'react'

export default function DownloadPdfButton() {
  const downloadPdf = async () => {
    // call your API route; you can pass the page URL if dynamic
    // const res = await fetch(`/api/pdf?url=${encodeURIComponent(window.location.href)}`)
    const res = await fetch(`/api/pdf?url=${encodeURIComponent(window.location.href)}`, {
        method: 'GET',
        credentials: 'include',  // ← send cookies
      })
    if (!res.ok) {
      return alert('Failed to generate PDF')
    }
    const blob = await res.blob()
    // trigger a browser download
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'report.pdf'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <button
      onClick={downloadPdf}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      Download PDF
    </button>
  )
}
