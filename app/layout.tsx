
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Document Scanner',
  description: 'AI-powered document scanning and email application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
