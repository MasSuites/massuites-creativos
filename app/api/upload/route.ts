import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  decodeCredentials,
  PLATFORM_KEY_COOKIE,
} from "@/generation/credentials"
import { createPlatformClient, PlatformError } from "@/generation/platform"
import { requireUploadContentType } from "@/generation/upload-contract"

export async function POST(request: Request): Promise<NextResponse> {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin)
    return failure(403, "No se permiten subidas desde otro origen.")

  let contentType: string
  try {
    const body: unknown = await request.json()
    contentType = requireUploadContentType(
      body && typeof body === "object" && "contentType" in body
        ? body.contentType
        : null
    )
  } catch (error) {
    return failure(
      400,
      error instanceof SyntaxError
        ? "Solicitud de subida no valida."
        : "Tipo de archivo no soportado. Usa JPEG, PNG, WebP, GIF, MP4 o WAV."
    )
  }

  const jar = await cookies()
  const credentials = decodeCredentials(jar.get(PLATFORM_KEY_COOKIE)?.value)
  if (!credentials)
    return failure(
      401,
      "Conecta tu API key de Higgsfield en la barra lateral (Connect API key) antes de subir archivos."
    )
  const baseUrl = process.env.HF_API_BASE_URL
  if (!baseUrl)
    return failure(
      503,
      "Las subidas no estan configuradas: falta HF_API_BASE_URL en el servidor."
    )

  try {
    const ticket = await createPlatformClient({
      ...credentials,
      baseUrl,
    }).createUpload(contentType)
    return NextResponse.json(ticket, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    const status = error instanceof PlatformError ? error.status : 502
    console.error("[upload] Could not prepare reference upload", { status })
    if (status === 401 || status === 403)
      return failure(
        status,
        "Higgsfield rechazo tu API key. Reemplazala en la barra lateral e intenta de nuevo."
      )
    if (status === 429)
      return failure(
        429,
        "Higgsfield limito las subidas por un momento. Espera e intenta de nuevo."
      )
    return failure(
      502,
      "No se pudo preparar la subida con Higgsfield. Intenta de nuevo."
    )
  }
}

function failure(status: number, error: string): NextResponse {
  return NextResponse.json(
    { error },
    { status, headers: { "Cache-Control": "no-store" } }
  )
}
