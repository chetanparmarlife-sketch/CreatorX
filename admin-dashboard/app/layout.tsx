import type { Metadata } from "next"
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})
const ibmPlexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "CreatorX Admin Console",
  description: "Operational controls and monitoring",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${ibmPlexCondensed.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
