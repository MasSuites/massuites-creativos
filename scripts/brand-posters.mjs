#!/usr/bin/env node
// Genera las portadas de marca de los presets (public/presets/*.svg).
//
// Paleta oficial MasSuites (assets/marca/MARCA-MASSUITES.md del sistema):
// negro #0B0A07 · morado oscuro #49486B · morado medio #54527B · morado claro #5F5B89
// · lavanda #696598 · tinte #EFEEF6. Son portadas vectoriales, no fotografias:
// en cuanto la app tenga salidas reales, la portada de cada preset y el hero se
// sustituyen solos por las ultimas generaciones (layouts/studio.tsx).
// Corre en `prebuild` y `predev`; no toca nada si el archivo ya es identico.
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "presets")
const W = 800
const H = 450
const FONT = "Poppins, Inter, Arial, sans-serif"

// [id, titulo, formato, motivo]
const POSTERS = [
  ["reel-recorrido", "Reel de recorrido", "VIDEO · 9:16", "ventana"],
  ["post-instagram", "Post para Instagram", "IMAGEN · 1:1", "sala"],
  ["anuncio-meta", "Anuncio en Meta", "IMAGEN · 3:4", "oferta"],
  ["historia-llegada", "Historia: llegas y descansas", "VIDEO · 9:16", "noche"],
  ["foto-a-video", "Tu foto, en movimiento", "VIDEO · desde foto", "foto"],
  ["queretaro-vida", "Querétaro, tu ciudad", "IMAGEN · 16:9", "skyline"],
  ["estancia-ejecutiva", "Estancia ejecutiva", "IMAGEN · 3:4", "escritorio"],
  ["portada-web", "Portada para massuites.mx", "IMAGEN · 16:9", "web"],
]

function motivo(kind) {
  switch (kind) {
    case "skyline": {
      let bars = ""
      const xs = [430, 500, 570, 640, 710]
      const hs = [200, 260, 170, 230, 150]
      xs.forEach((x, i) => {
        const h = hs[i]
        bars += `<rect x="${x}" y="${H - 90 - h}" width="56" height="${h}" rx="6" fill="#5F5B89" opacity="0.55"/>`
        for (let wy = H - 90 - h + 18; wy < H - 100; wy += 26) {
          bars += `<rect x="${x + 12}" y="${wy}" width="10" height="12" rx="2" fill="#EFEEF6" opacity="0.35"/><rect x="${x + 38}" y="${wy}" width="10" height="12" rx="2" fill="#EFEEF6" opacity="0.2"/>`
        }
      })
      return bars + `<rect x="0" y="${H - 90}" width="${W}" height="90" fill="#0B0A07" opacity="0.35"/>`
    }
    case "ventana":
      return (
        '<rect x="470" y="70" width="260" height="300" rx="18" fill="#EFEEF6" opacity="0.12"/>' +
        '<rect x="490" y="90" width="105" height="125" rx="8" fill="#EFEEF6" opacity="0.28"/>' +
        '<rect x="605" y="90" width="105" height="125" rx="8" fill="#EFEEF6" opacity="0.22"/>' +
        '<rect x="490" y="225" width="105" height="125" rx="8" fill="#EFEEF6" opacity="0.18"/>' +
        '<rect x="605" y="225" width="105" height="125" rx="8" fill="#EFEEF6" opacity="0.3"/>' +
        '<circle cx="640" cy="150" r="34" fill="#F6D98A" opacity="0.7"/>'
      )
    case "sala":
      return (
        '<rect x="470" y="250" width="280" height="90" rx="22" fill="#EFEEF6" opacity="0.22"/>' +
        '<rect x="450" y="215" width="60" height="120" rx="20" fill="#EFEEF6" opacity="0.28"/>' +
        '<rect x="710" y="215" width="60" height="120" rx="20" fill="#EFEEF6" opacity="0.28"/>' +
        '<rect x="520" y="120" width="180" height="24" rx="12" fill="#EFEEF6" opacity="0.18"/>' +
        '<circle cx="610" cy="185" r="26" fill="#F6D98A" opacity="0.55"/>'
      )
    case "oferta":
      return (
        '<circle cx="640" cy="200" r="120" fill="#EFEEF6" opacity="0.1"/>' +
        '<circle cx="640" cy="200" r="86" fill="#5F5B89" opacity="0.6"/>' +
        `<text x="640" y="192" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="700" fill="#EFEEF6">DESDE</text>` +
        `<text x="640" y="236" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="700" fill="#F6D98A">1 NOCHE</text>`
      )
    case "noche": {
      const stars = [
        [480, 70, 2],
        [560, 110, 3],
        [700, 60, 2],
        [640, 140, 2],
        [740, 160, 3],
        [520, 180, 2],
      ]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#EFEEF6" opacity="0.6"/>`)
        .join("")
      return (
        stars +
        '<circle cx="690" cy="110" r="38" fill="#EFEEF6" opacity="0.85"/><circle cx="705" cy="100" r="34" fill="#49486B"/>' +
        '<rect x="460" y="230" width="300" height="130" rx="18" fill="#EFEEF6" opacity="0.14"/>' +
        '<rect x="490" y="255" width="90" height="70" rx="10" fill="#F6D98A" opacity="0.55"/>' +
        '<rect x="600" y="255" width="130" height="70" rx="10" fill="#EFEEF6" opacity="0.2"/>'
      )
    }
    case "foto":
      return (
        '<rect x="470" y="80" width="250" height="180" rx="16" fill="#EFEEF6" opacity="0.16" transform="rotate(-6 595 170)"/>' +
        '<rect x="500" y="110" width="250" height="180" rx="16" fill="#EFEEF6" opacity="0.28" transform="rotate(4 625 200)"/>' +
        '<polygon points="600,180 660,215 600,250" fill="#0B0A07" opacity="0.6"/>' +
        '<path d="M560 330 q90 40 180 0" stroke="#F6D98A" stroke-width="5" fill="none" opacity="0.8"/>' +
        '<polygon points="735,320 750,332 733,340" fill="#F6D98A" opacity="0.8"/>'
      )
    case "escritorio":
      return (
        '<rect x="450" y="250" width="310" height="16" rx="8" fill="#EFEEF6" opacity="0.35"/>' +
        '<rect x="470" y="266" width="14" height="90" fill="#EFEEF6" opacity="0.2"/><rect x="726" y="266" width="14" height="90" fill="#EFEEF6" opacity="0.2"/>' +
        '<rect x="540" y="150" width="140" height="92" rx="8" fill="#EFEEF6" opacity="0.3"/>' +
        '<rect x="600" y="242" width="20" height="10" fill="#EFEEF6" opacity="0.3"/>' +
        '<rect x="700" y="200" width="36" height="46" rx="8" fill="#F6D98A" opacity="0.6"/>'
      )
    case "web":
      return (
        '<rect x="450" y="80" width="310" height="280" rx="14" fill="#EFEEF6" opacity="0.12"/>' +
        '<rect x="450" y="80" width="310" height="34" rx="14" fill="#EFEEF6" opacity="0.18"/>' +
        '<circle cx="472" cy="97" r="5" fill="#EFEEF6" opacity="0.5"/><circle cx="490" cy="97" r="5" fill="#EFEEF6" opacity="0.5"/>' +
        '<rect x="470" y="135" width="270" height="120" rx="10" fill="#5F5B89" opacity="0.7"/>' +
        '<rect x="470" y="270" width="120" height="14" rx="7" fill="#EFEEF6" opacity="0.4"/>' +
        '<rect x="470" y="294" width="200" height="10" rx="5" fill="#EFEEF6" opacity="0.25"/>' +
        '<rect x="470" y="320" width="90" height="26" rx="13" fill="#F6D98A" opacity="0.75"/>'
      )
    default:
      return ""
  }
}

function poster(titulo, formato, kind) {
  const pillW = 18 + 9 * formato.length
  const pillX = (44 + pillW / 2).toFixed(1)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${titulo} — ${formato}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#49486B"/>
      <stop offset="0.55" stop-color="#54527B"/>
      <stop offset="1" stop-color="#696598"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.25" r="0.6">
      <stop offset="0" stop-color="#EFEEF6" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#EFEEF6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${motivo(kind)}
  <text x="44" y="78" font-family="${FONT}" font-size="30" font-weight="700" fill="#EFEEF6"><tspan fill="#C9C4E6">+</tspan> SUITES</text>
  <text x="46" y="104" font-family="${FONT}" font-size="13" letter-spacing="3" fill="#EFEEF6" opacity="0.75">COMO EN CASA · QUERÉTARO</text>
  <text x="44" y="330" font-family="${FONT}" font-size="38" font-weight="700" fill="#EFEEF6">${titulo}</text>
  <rect x="44" y="352" width="${pillW}" height="34" rx="17" fill="#0B0A07" opacity="0.45"/>
  <text x="${pillX}" y="375" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="600" letter-spacing="1" fill="#EFEEF6">${formato}</text>
</svg>
`
}

await mkdir(OUT, { recursive: true })
let escritas = 0
for (const [id, titulo, formato, kind] of POSTERS) {
  const file = join(OUT, `${id}.svg`)
  const svg = poster(titulo, formato, kind)
  const actual = await readFile(file, "utf8").catch(() => null)
  if (actual === svg) continue
  await writeFile(file, svg, "utf8")
  escritas++
}
console.log(
  escritas
    ? `brand-posters: ${escritas} portada(s) escritas en public/presets`
    : "brand-posters: las portadas ya estaban al dia"
)
