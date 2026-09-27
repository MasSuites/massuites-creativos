import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"

import { cn } from "@/lib/utils"

import "./globals.css"

// Fuentes servidas desde el repo (OFL): Poppins es la tipografia institucional de
// MasSuites (la misma de la guia del huesped); Inter e IBM Plex Mono son las que el
// tema Quanta usa para texto y monoespaciado. globals.css las mapea a
// --hf-type-family-*-base a traves de las variables de abajo.
const poppins = localFont({
  src: [
    { path: "../assets/fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../assets/fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../assets/fonts/Poppins-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
})
const inter = localFont({
  src: [{ path: "../assets/fonts/Inter-Variable.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
})
const plexMono = localFont({
  src: [
    { path: "../assets/fonts/IBMPlexMono-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/IBMPlexMono-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MasSuites Creativos",
  description:
    "Imagenes y videos para promocionar los departamentos amueblados de MasSuites en Queretaro, generados con los modelos de Higgsfield.",
  applicationName: "MasSuites Creativos",
}

export const viewport: Viewport = { themeColor: "#131416" }

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-theme="default-dark"
      className={cn(
        "dark font-sans antialiased",
        poppins.variable,
        inter.variable,
        plexMono.variable
      )}
    >
      <body className="min-h-svh bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
