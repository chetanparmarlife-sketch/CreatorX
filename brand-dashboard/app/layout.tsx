import type { Metadata } from "next"
import { Playfair_Display, Sora } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const sora = Sora({ subsets: ["latin"], variable: "--font-sans" })
const playfairDisplay = Playfair_Display({
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
      <body className={`${sora.variable} ${playfairDisplay.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
