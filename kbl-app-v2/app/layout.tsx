import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"

import  ZigZag  from "@/components/animata/background/zigzag"
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "KUCHBHI IPL 2025 DREAM11 LEAGUE",
  description: "Track your team's performance in the IPL 2025 Dream11 Fantasy League",
    generator: 'saku'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {/* <MovingGradient className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {children}
        </MovingGradient> */}
        <ZigZag size={15}>{children}</ZigZag>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
import MovingGradient from "@/components/animata/background/moving-gradient"
