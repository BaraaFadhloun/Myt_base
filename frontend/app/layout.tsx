import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import Header from "@/components/Header"
import SlidingPanel from "@/components/SlidingPanel"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Python Course Platform",
  description: "Learn Python with interactive video lessons and quizzes",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow relative">
              <SlidingPanel />
              <main className="pt-16 px-4 sm:px-6 lg:px-8">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
