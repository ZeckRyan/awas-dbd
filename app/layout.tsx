import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dengue Detector - Deteksi DBD Lebih Dini',
  description: 'Sistem deteksi Demam Berdarah Dengue (DBD) menggunakan AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="shortcut icon" href="/uty_logo.png" type="image/x-icon" />
      </head>
      <body>{children}</body>
    </html>
  )
}
