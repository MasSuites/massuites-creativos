# MasSuites Creativos

Estudio para que Ventas y Marketing de MasSuites generen **imágenes y videos** para
promocionar los departamentos amueblados en Querétaro (Instagram, Facebook/Meta, TikTok,
Google y massuites.mx) con los modelos de [Higgsfield](https://open.higgsfield.ai)
(Seedance, Kling, Soul, Flux, Wan y más), en el morado institucional y con presets en español.

Construido sobre el template **Studio** de Higgsfield (Next.js 16 + Tailwind v4 + shadcn/Base UI).

## Arrancar

```sh
pnpm install
pnpm dev          # http://localhost:3000
```

1. Abre la app y toca **Connect API key** en la barra lateral.
2. Pega la API key completa copiada de <https://open.higgsfield.ai/api-keys> tal cual
   (no se separa ni se edita). Queda en una cookie HTTP-only de tu navegador; el servidor
   es el único que habla con Higgsfield.
3. En Inicio, toca **Usar** en un preset (Reel de recorrido, Post para Instagram, Anuncio en
   Meta, Historia, Tu foto en movimiento, Querétaro tu ciudad, Estancia ejecutiva, Portada
   para massuites.mx), ajusta el texto y **Generar**. Para animar una foto real del
   departamento, súbela con el botón **+** del dock antes de generar.

Para producción: `pnpm build && pnpm start`, con `HF_API_BASE_URL=https://api.higgsfield.ai`
en el entorno del servidor (ver `.env.example`).

## Qué hay adentro

| Carpeta | Qué es |
|---|---|
| `app/` | App Router de Next: `layout.tsx` (fuentes locales Poppins/Inter/IBM Plex Mono, metadatos), `api/upload/route.ts` (URL firmada para subir referencias con la llave guardada) |
| `layouts/studio.tsx` | La pantalla del estudio: barra lateral de proyectos, hero, dock de prompt, presets, feed |
| `components/studio/` | Piezas del estudio; `template-picker.tsx` trae los presets de MasSuites |
| `generation/` | Cliente del API de Higgsfield (`platform.ts`), server actions (`actions.ts`), polling con backoff (`poll.ts`), catálogo de modelos (`catalog/models/*.ts`, un archivo por modelo) |
| `lib/studio/` | Historial y proyectos en el navegador (IndexedDB) |
| `public/presets/` | Portadas de marca de los presets (`scripts/brand-posters.py` las regenera) |
| `assets/fonts/` | Fuentes OFL servidas localmente; `scripts/fetch-fonts.mjs` las descarga de google/fonts en `prebuild` (no van en el repo) |

## Cómo se habla con Higgsfield

- Envío: `POST https://api.higgsfield.ai/<ruta-del-modelo>` con `Authorization: Key <api-key>`.
- Estado: `GET /requests/<request_id>/status` hasta `completed` / `failed` / `nsfw` / `canceled`,
  empezando cada 2 s y espaciando hasta 10 s (todas las peticiones en vuelo en una sola
  ronda). Sin `Retry-After`: el límite de concurrencia llega como `400`.
- Cancelar: `POST /requests/<request_id>/cancel` (solo mientras está en cola).
- Referencias: el servidor pide `POST /files/generate-upload-url`; el navegador hace el `PUT`
  a la URL firmada con los encabezados que devuelve y sin credenciales; la `public_url` se usa
  solo si el `PUT` salió bien. Las URL firmadas nunca se escriben en logs.
- Un envío que se quede sin respuesta **no se reintenta solo** (el API no acepta clave de
  idempotencia): queda como fallido en el feed y la persona decide.

## Modelos

El catálogo completo del template está instalado (28 archivos en `generation/catalog/models/`;
el barrel `models.generated.ts` se regenera solo en `pnpm dev` / `pnpm build`, no se edita a
mano). Agregar o refrescar uno:

```sh
pnpm dlx shadcn@latest list higgsfield-ai/app-templates
pnpm dlx shadcn@latest add  higgsfield-ai/app-templates/<modelo>
```

## Verificar

```sh
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

## Llave compartida (opcional, no configurado)

Hoy cada persona conecta su propia llave. Si Dirección prefiere una llave única del negocio,
la adaptación es: leer `HF_API_KEY` (solo servidor) en `generation/actions.ts` y en la ruta de
subida, guardar cada `request_id` con el usuario que lo creó y verificar esa propiedad antes de
devolver estado, resultados o cancelar. El historial del navegador no es un control de acceso.
