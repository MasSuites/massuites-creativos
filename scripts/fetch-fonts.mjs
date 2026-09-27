#!/usr/bin/env node
// Descarga las fuentes OFL que usa app/layout.tsx (Poppins, Inter, IBM Plex Mono) desde el
// repositorio google/fonts en GitHub y comprueba su SHA-256. Corre solo en `pnpm build`
// (prebuild) y no toca nada si los archivos ya estan y coinciden. Asi el repo no carga
// 1.8 MB de binarios y el despliegue en Render los trae en segundos.
import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const BASE = "https://raw.githubusercontent.com/google/fonts/main/"
const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "fonts")

// nombre local -> [ruta en google/fonts, sha256 esperado]
const FONTS = {
  "Poppins-Regular.ttf": ["ofl/poppins/Poppins-Regular.ttf", "7e65201e9b79159e"],
  "Poppins-Medium.ttf": ["ofl/poppins/Poppins-Medium.ttf", "90373e7d838d3246"],
  "Poppins-SemiBold.ttf": ["ofl/poppins/Poppins-SemiBold.ttf", "d3bf1bdaf0550e83"],
  "Poppins-Bold.ttf": ["ofl/poppins/Poppins-Bold.ttf", "983676516167748b"],
  "OFL-Poppins.txt": ["ofl/poppins/OFL.txt", "6be04893d770899a"],
  "Inter-Variable.ttf": ["ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf", "29160a80ff49ddca"],
  "IBMPlexMono-Regular.ttf": ["ofl/ibmplexmono/IBMPlexMono-Regular.ttf", "6a3412f058c7d8df"],
  "IBMPlexMono-Medium.ttf": ["ofl/ibmplexmono/IBMPlexMono-Medium.ttf", "a9b4c49bb299e05b"],
}

const sha = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 16)

async function present(name, expected) {
  try {
    return sha(await readFile(join(DIR, name))) === expected
  } catch {
    return false
  }
}

await mkdir(DIR, { recursive: true })
let bajadas = 0
for (const [name, [path, expected]] of Object.entries(FONTS)) {
  if (await present(name, expected)) continue
  const res = await fetch(BASE + path)
  if (!res.ok) throw new Error(`No se pudo bajar ${name}: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const got = sha(buf)
  if (got !== expected)
    throw new Error(`${name}: SHA-256 ${got} distinto del esperado ${expected}`)
  await writeFile(join(DIR, name), buf)
  bajadas++
}
console.log(
  bajadas
    ? `fetch-fonts: ${bajadas} archivo(s) descargados en assets/fonts`
    : "fetch-fonts: las fuentes ya estaban completas"
)
