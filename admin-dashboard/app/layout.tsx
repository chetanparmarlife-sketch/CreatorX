import type { Metadata } from "next"
import { Manrope, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "CreatorX Brand Dashboard",
  description: "Manage your influencer campaigns",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
