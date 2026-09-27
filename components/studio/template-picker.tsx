/* eslint-disable @next/next/no-img-element */
"use client"

import type { KeyboardEvent, ReactNode } from "react"
import {
  BriefcaseBusiness,
  Camera,
  Clapperboard,
  Film,
  Globe,
  MapPin,
  Megaphone,
  MoonStar,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Presets — "lo que puedes hacer" para el equipo de MasSuites. Un `TemplateItem`
 * deja listo el dock (prompt + modelo y ajustes opcionales) al tocar "Usar".
 * `TemplateCard` y `ExamplePresets` los pintan; la pestana Explorar de Inicio usa
 * `ExamplePresets`.
 */

// Portadas de marca en /presets/*.svg (scripts/brand-posters.mjs). Cuando la app ya tiene
// salidas reales, layouts/studio.tsx las sustituye por las ultimas generaciones del mismo tipo.
const POSTER = (name: string) => `/presets/${name}.svg` as const

export interface TemplateItem {
  id: string
  title: string
  subtitle: string
  /** Free-form filter category used by the picker tabs. */
  category: string
  kind: "image" | "video"
  images: [string, string, string]
  icon: LucideIcon
  /** What the Try action puts in the dock. */
  prompt: string
  /** Catalog model id to switch to, when the template needs a specific one. */
  modelId?: string
  settings?: Record<string, unknown>
  /** Consejo corto que se muestra bajo el subtitulo (p. ej. que foto subir antes de generar). */
  hint?: string
}

// Los presets de MasSuites: creativos para vender estancias en departamentos amueblados
// de Queretaro (Instagram, Facebook/Meta, TikTok, Google y massuites.mx). Cada uno deja
// el prompt listo y, cuando el formato lo exige, fija el modelo y la relacion de aspecto.
// Los modelos fijados existen en el catalogo instalado (soul-2 y seedance-2.5); si algun
// dia se quitan, el preset solo cambia de superficie y deja el modelo activo.
const ESTILO_FOTO =
  "Fotografia real de interiores, luz natural de dia, colores calidos, encuadre amplio con lente de 24 mm, sin personas, sin texto ni logotipos, estilo Airbnb premium."

export const TEMPLATES: TemplateItem[] = [
  {
    id: "reel-recorrido",
    title: "Reel de recorrido",
    subtitle: "Video vertical 9:16 para Instagram y TikTok",
    category: "video",
    kind: "video",
    images: [
      POSTER("reel-recorrido"),
      POSTER("post-instagram"),
      POSTER("historia-llegada"),
    ],
    icon: Clapperboard,
    prompt:
      "Recorrido en video de un departamento amueblado en Queretaro: la camara avanza despacio desde la puerta hacia la sala con sofa gris y cojines, sigue a la cocina integral con barra y bancos, y termina en la recamara con cama king tendida en blanco y luz de ventana. Movimiento suave tipo gimbal, luz natural de manana, colores calidos, sin personas, sin texto.",
    modelId: "seedance-2.5",
    settings: {
      aspectRatio: "9:16",
      duration: 8,
      resolution: "720p",
      generateAudio: true,
    },
    hint: "Agrega una foto real del depto como referencia para que el recorrido se parezca al espacio.",
  },
  {
    id: "post-instagram",
    title: "Post para Instagram",
    subtitle: "Imagen cuadrada 1:1, sala o recámara",
    category: "imagen",
    kind: "image",
    images: [
      POSTER("post-instagram"),
      POSTER("reel-recorrido"),
      POSTER("estancia-ejecutiva"),
    ],
    icon: Camera,
    prompt:
      "Sala de un departamento amueblado en Queretaro lista para recibir huespedes: sofa gris con cojines morados, mesa de centro de madera, planta, television, ventanal con luz de manana y vista a la ciudad. " +
      ESTILO_FOTO,
    modelId: "soul-2",
    settings: { aspectRatio: "1:1", resolution: "1080p", batchSize: "4" },
    hint: "Salen 4 opciones; elige la mejor y descárgala para el feed.",
  },
  {
    id: "anuncio-meta",
    title: "Anuncio en Meta",
    subtitle: "Imagen 3:4 con espacio limpio para el texto de la oferta",
    category: "imagen",
    kind: "image",
    images: [
      POSTER("anuncio-meta"),
      POSTER("post-instagram"),
      POSTER("portada-web"),
    ],
    icon: Megaphone,
    prompt:
      "Recamara de departamento amueblado en Queretaro con cama king tendida en blanco, cabecera tapizada, buros con lamparas encendidas y cortinas claras; la parte superior de la imagen queda despejada, con pared lisa clara, para sobreponer el texto del anuncio. " +
      ESTILO_FOTO,
    modelId: "soul-2",
    settings: { aspectRatio: "3:4", resolution: "1080p", batchSize: "4" },
    hint: "El tercio superior queda libre: ahí va el precio o la promoción en el editor de Meta.",
  },
  {
    id: "historia-llegada",
    title: "Historia: llegas y descansas",
    subtitle: "Video 9:16 de ambiente, para historias y TikTok",
    category: "video",
    kind: "video",
    images: [
      POSTER("historia-llegada"),
      POSTER("reel-recorrido"),
      POSTER("queretaro-vida"),
    ],
    icon: MoonStar,
    prompt:
      "Atardecer en un departamento amueblado en Queretaro: las lamparas de la sala se encienden una a una, la ciudad se ve por el ventanal con luces calidas, una taza humeante sobre la barra de la cocina, ambiente tranquilo y acogedor. Camara fija con un ligero acercamiento, sin personas, sin texto.",
    modelId: "seedance-2.5",
    settings: {
      aspectRatio: "9:16",
      duration: 6,
      resolution: "720p",
      generateAudio: true,
    },
  },
  {
    id: "foto-a-video",
    title: "Tu foto, en movimiento",
    subtitle: "Anima una foto real del departamento",
    category: "video",
    kind: "video",
    images: [
      POSTER("foto-a-video"),
      POSTER("reel-recorrido"),
      POSTER("post-instagram"),
    ],
    icon: Film,
    prompt:
      "A partir de esta fotografia del departamento, la camara avanza muy despacio hacia el interior con un ligero movimiento lateral; la luz de la ventana cambia sutilmente como si pasara una nube; todo lo demas permanece igual, sin agregar objetos ni personas, sin texto.",
    modelId: "seedance-2.5",
    settings: {
      aspectRatio: "9:16",
      duration: 5,
      resolution: "720p",
      generateAudio: false,
    },
    hint: "Sube la foto del departamento como referencia de inicio antes de generar.",
  },
  {
    id: "queretaro-vida",
    title: "Querétaro, tu ciudad",
    subtitle: "Imagen 16:9 de estilo de vida para posts y anuncios",
    category: "imagen",
    kind: "image",
    images: [
      POSTER("queretaro-vida"),
      POSTER("portada-web"),
      POSTER("historia-llegada"),
    ],
    icon: MapPin,
    prompt:
      "Vista de Queretaro al atardecer desde la terraza de un departamento moderno: acueducto y cupulas del centro historico a lo lejos, cielo naranja y morado, dos copas sobre una mesa de terraza en primer plano, sin personas, sin texto. Fotografia real, lente 35 mm, colores calidos.",
    modelId: "soul-2",
    settings: { aspectRatio: "16:9", resolution: "1080p", batchSize: "4" },
  },
  {
    id: "estancia-ejecutiva",
    title: "Estancia ejecutiva",
    subtitle: "Imagen 3:4 para viajeros de negocios y estancias largas",
    category: "imagen",
    kind: "image",
    images: [
      POSTER("estancia-ejecutiva"),
      POSTER("post-instagram"),
      POSTER("anuncio-meta"),
    ],
    icon: BriefcaseBusiness,
    prompt:
      "Rincon de trabajo dentro de un departamento amueblado en Queretaro: escritorio de madera junto a la ventana, laptop cerrada, silla comoda, cafetera y taza, planta, luz natural de manana, al fondo la cama tendida. " +
      ESTILO_FOTO,
    modelId: "soul-2",
    settings: { aspectRatio: "3:4", resolution: "1080p", batchSize: "4" },
  },
  {
    id: "portada-web",
    title: "Portada para massuites.mx",
    subtitle: "Imagen 16:9 amplia para la página y Google",
    category: "imagen",
    kind: "image",
    images: [
      POSTER("portada-web"),
      POSTER("queretaro-vida"),
      POSTER("post-instagram"),
    ],
    icon: Globe,
    prompt:
      "Panoramica de la sala y cocina integral de un departamento amueblado en Queretaro, muy luminosa, decoracion contemporanea en tonos neutros con acentos morados, ventanal grande al fondo, todo ordenado y listo para el huesped. " +
      ESTILO_FOTO,
    modelId: "soul-2",
    settings: { aspectRatio: "16:9", resolution: "1080p", batchSize: "4" },
  },
]

function gradientFromSeed(seed: string): string {
  let hash = 0
  for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) >>> 0
  const start = hash % 360
  const end = (start + 36 + ((hash >>> 8) % 72)) % 360
  return `linear-gradient(135deg, hsl(${start} 62% 52%) 0%, hsl(${end} 76% 27%) 100%)`
}

function GradientBadge({ as: Glyph, seed }: { as: LucideIcon; seed: string }) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/25 text-white shadow-[0_5px_3px_rgba(0,0,0,0.08),inset_0_3px_5px_rgba(255,255,255,0.24)]">
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: gradientFromSeed(seed) }}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 mix-blend-overlay"
      />
      <Glyph className="relative size-5" />
    </span>
  )
}

const TRIPTYCH = [
  "rounded-l-2xl rounded-r-sm",
  "rounded-sm",
  "rounded-r-2xl rounded-l-sm",
] as const

export interface TemplateCardProps {
  template: TemplateItem
  variant?: "single" | "triptych"
  onTry: (template: TemplateItem) => void
  tryLabel?: ReactNode
}

export function TemplateCard({
  template,
  variant = "single",
  onTry,
  tryLabel = "Usar",
}: TemplateCardProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onTry(template)
    }
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Usar preset: ${template.title}`}
      className="relative flex cursor-pointer flex-col gap-2 rounded-[20px] bg-white/5 p-2 shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-[transform,background-color] duration-200 hover:z-[1] hover:-translate-y-0.5 hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:hover:translate-y-0"
      onClick={() => onTry(template)}
      onKeyDown={onKeyDown}
    >
      <div className="flex h-60 items-stretch gap-1.5">
        {variant === "triptych" ? (
          template.images.map((src, i) => (
            <div
              key={i}
              className={cn(
                "min-w-0 flex-1 overflow-hidden border border-white/10",
                TRIPTYCH[i]
              )}
            >
              <img
                src={src}
                alt={`${template.title} — toma ${i + 1}`}
                className="size-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10">
            <img
              src={template.images[0]}
              alt={template.title}
              className="size-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 px-2 py-1">
        <GradientBadge as={template.icon} seed={template.id} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {template.title}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {template.subtitle}
          </span>
          {template.hint ? (
            <span className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/80">
              {template.hint}
            </span>
          ) : null}
        </div>
        <Button
          size="sm"
          className="rounded-full font-semibold"
          onClick={(event) => {
            event.stopPropagation()
            onTry(template)
          }}
        >
          {tryLabel}
        </Button>
      </div>
    </div>
  )
}

export interface ExamplePresetsProps {
  items: TemplateItem[]
  onUse: (template: TemplateItem) => void
  tryLabel?: ReactNode
  className?: string
}

/** The Explore grid: two columns of `TemplateCard`s. */
export function ExamplePresets({
  items,
  onUse,
  tryLabel = "Usar",
  className = "w-full max-w-[900px]",
}: ExamplePresetsProps) {
  return (
    <div
      className={cn("grid w-full grid-cols-1 gap-5 sm:grid-cols-2", className)}
    >
      {items.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          onTry={onUse}
          tryLabel={tryLabel}
        />
      ))}
    </div>
  )
}
