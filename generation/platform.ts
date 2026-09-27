import { toAuthorizationHeader } from "./credentials"
import { parseUploadTicket, requireUploadContentType } from "./upload-contract"
import type { UploadTicket } from "./upload-contract"

const UPLOAD_PATH = "/files/generate-upload-url"
const MODEL_ID = /^[a-z0-9][a-z0-9._/-]*$/i

export class PlatformError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    super(messageFromBody(status, body))
    this.name = "PlatformError"
    this.status = status
    this.body = body
  }
}

export type QueuedGeneration = {
  status: string
  requestId: string
  statusUrl: string
  cancelUrl: string
}

export type GenerationStatus = {
  status: string
  requestId: string
  images?: Array<{ url: string }>
  video?: { url: string }
  error?: unknown
}

/** One request's answer inside a batched status poll. A request that errors
    carries its reason alone, so it cannot lose the answers standing beside it. */
export type StatusResult =
  | { requestId: string; status: GenerationStatus }
  | { requestId: string; error: string }

export type PlatformClientOptions = {
  apiKey: string
  baseUrl: string
  fetch?: typeof fetch
}

export function isModelId(model: string): boolean {
  return MODEL_ID.test(model) && !model.includes("..")
}

export function createPlatformClient(options: PlatformClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, "")
  const fetchImpl = options.fetch ?? fetch
  const auth = toAuthorizationHeader(options.apiKey)

  async function send(
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>
  ) {
    const url = `${baseUrl}${path}`
    console.info("[platform] request", { method, url, body: body ?? null })
    const response = await fetchImpl(url, {
      method,
      headers: {
        Authorization: auth,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    const payload = await readJson(response)
    // Signed upload URLs are credentials; do not write them to logs.
    console.info("[platform] response", {
      method,
      url,
      status: response.status,
      ...(path === UPLOAD_PATH ? {} : { body: payload }),
    })
    if (!response.ok) throw new PlatformError(response.status, payload)
    return payload
  }

  return {
    async createUpload(contentType: unknown): Promise<UploadTicket> {
      const type = requireUploadContentType(contentType)
      return parseUploadTicket(
        await send("POST", UPLOAD_PATH, { content_type: type }),
        type
      )
    },
    async submit(
      model: string,
      input: Record<string, unknown>
    ): Promise<QueuedGeneration> {
      if (!isModelId(model))
        throw new PlatformError(400, { detail: "Invalid model" })
      return mapQueued(await send("POST", `/${model}`, input))
    },
    async status(requestId: string): Promise<GenerationStatus> {
      if (!requestId)
        throw new PlatformError(400, { detail: "Missing request id" })
      return mapStatus(
        await send("GET", `/requests/${encodeURIComponent(requestId)}/status`)
      )
    },
    /** Queued requests only; the platform answers 202 and the status turns "canceled". */
    async cancel(requestId: string): Promise<void> {
      if (!requestId)
        throw new PlatformError(400, { detail: "Missing request id" })
      await send(
        "POST",
        `/requests/${encodeURIComponent(requestId)}/cancel`,
        {}
      )
    },
  }
}

function mapQueued(payload: unknown): QueuedGeneration {
  const data = asRecord(payload)
  const requestId = stringField(data, "request_id")
  if (!requestId)
    throw new PlatformError(502, {
      detail: "Platform response missing request_id",
    })
  return {
    status: stringField(data, "status") ?? "queued",
    requestId,
    statusUrl: stringField(data, "status_url") ?? "",
    cancelUrl: stringField(data, "cancel_url") ?? "",
  }
}

function mapStatus(payload: unknown): GenerationStatus {
  const data = asRecord(payload)
  const requestId = stringField(data, "request_id") ?? ""
  const images = Array.isArray(data.images)
    ? data.images.flatMap((item) => {
        const url = asRecord(item).url
        return typeof url === "string" ? [{ url }] : []
      })
    : undefined
  const videoUrl = asRecord(data.video).url

  return {
    status: stringField(data, "status") ?? "unknown",
    requestId,
    ...(images?.length ? { images } : {}),
    ...(typeof videoUrl === "string" ? { video: { url: videoUrl } } : {}),
    ...(data.error !== undefined ? { error: data.error } : {}),
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function stringField(
  value: Record<string, unknown>,
  key: string
): string | undefined {
  const field = value[key]
  return typeof field === "string" ? field : undefined
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

// Lo que ve la persona en el dock cuando Higgsfield contesta con error (docs/concepts/errors):
// el `detail` del API manda cuando viene; si no, un texto por codigo.
const STATUS_TEXT: Record<number, string> = {
  400: "Higgsfield rechazo la peticion (parametros no validos o limite de peticiones simultaneas). Espera a que termine alguna o revisa los ajustes.",
  401: "Higgsfield no reconoce la API key. Reemplazala en la barra lateral (Manage API key).",
  402: "La cuenta de Higgsfield no tiene creditos suficientes.",
  403: "Higgsfield no autorizo la peticion (creditos insuficientes o llave sin permiso).",
  404: "Higgsfield no encuentra ese modelo o esa peticion en la cuenta.",
  422: "Higgsfield rechazo los datos enviados (revisa el prompt, las referencias y los ajustes).",
  423: "Ese modelo esta bloqueado temporalmente en Higgsfield. Intenta mas tarde o cambia de modelo.",
  429: "Higgsfield limito las peticiones por un momento. Espera e intenta de nuevo.",
  500: "Error inesperado en Higgsfield. Intenta de nuevo.",
  503: "Ese modelo no esta disponible en Higgsfield por ahora. Intenta mas tarde o cambia de modelo.",
}

// Codigos que Higgsfield manda en `detail` como identificador (sin espacios).
const DETAIL_TEXT: Record<string, string> = {
  not_enough_credits:
    "La cuenta de Higgsfield no tiene creditos suficientes. Recarga en open.higgsfield.ai (Top up) e intenta de nuevo.",
  invalid_credentials:
    "Higgsfield no reconoce la API key. Reemplazala en la barra lateral (Manage API key).",
}

function messageFromBody(status: number, body: unknown): string {
  const detail = asRecord(body).detail
  if (typeof detail === "string" && detail) {
    if (DETAIL_TEXT[detail]) return DETAIL_TEXT[detail]
    // Un identificador sin espacios se explica con el texto del codigo HTTP.
    if (/^[a-z0-9_.-]+$/i.test(detail) && STATUS_TEXT[status])
      return `${STATUS_TEXT[status]} (${detail})`
    return detail
  }
  if (Array.isArray(detail) && detail.length) {
    const partes = detail
      .map((d) => {
        const r = asRecord(d)
        return typeof r.msg === "string" ? r.msg : typeof d === "string" ? d : ""
      })
      .filter(Boolean)
    if (partes.length) return partes.join("; ")
  }
  return STATUS_TEXT[status] ?? `Higgsfield contesto con un error (${status}).`
}
