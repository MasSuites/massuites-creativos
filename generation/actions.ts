"use server"

import { cookies } from "next/headers"

import { getModel, parseSettings } from "./catalog"
import type { GenerationPlane } from "./catalog/types"
import {
  MissingCredentialsError,
  PLATFORM_KEY_COOKIE,
  PLATFORM_KEY_COOKIE_OPTIONS,
  decodeCredentials,
  encodeCredentials,
  parseCredentialInput,
} from "./credentials"
import { createPlatformClient } from "./platform"
import type { QueuedGeneration, StatusResult } from "./platform"
import { toPlatform } from "./to-platform"

/** Lo que devuelven las acciones que pueden fallar por culpa de Higgsfield o de la
    entrada. En produccion Next oculta el mensaje de cualquier error lanzado desde una
    server action (React #441), asi que el error viaja como valor y el dock lo muestra. */
export type ActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

function failure(caught: unknown): { ok: false; error: string } {
  return {
    ok: false,
    error: caught instanceof Error ? caught.message : String(caught),
  }
}

export async function savePlatformCredentials(
  data: unknown
): Promise<ActionResult<null>> {
  try {
    const { apiKey } = parseCredentialInput(data)
    const jar = await cookies()
    jar.set(
      PLATFORM_KEY_COOKIE,
      encodeCredentials(apiKey),
      PLATFORM_KEY_COOKIE_OPTIONS
    )
    return { ok: true, value: null }
  } catch (caught) {
    return failure(caught)
  }
}

export async function clearPlatformCredentials() {
  const jar = await cookies()
  jar.set(PLATFORM_KEY_COOKIE, "", {
    ...PLATFORM_KEY_COOKIE_OPTIONS,
    maxAge: 0,
  })
}

export async function hasPlatformCredentials() {
  return (await readStoredCredentials()) !== null
}

export async function submitGeneration(
  plane: GenerationPlane
): Promise<ActionResult<QueuedGeneration>> {
  try {
    const model = getModel(plane.model)
    const parsed: GenerationPlane = {
      ...plane,
      settings: parseSettings(model, plane.settings),
    }
    const { path, body } = toPlatform(parsed)
    const queued = await createPlatformClient(await readCredentials()).submit(
      path,
      body
    )
    return { ok: true, value: queued }
  } catch (caught) {
    return failure(caught)
  }
}

/** Every request in flight, answered in one round trip. Next dispatches server
    actions one at a time per client, so a poll per run would queue ahead of the
    next submit — the fan-out belongs on this side of the call, where it is
    genuinely parallel. */
export async function getGenerationStatuses(
  data: unknown
): Promise<StatusResult[]> {
  const requestIds = parseRequestIds(data)
  const client = createPlatformClient(await readCredentials())
  return Promise.all(
    requestIds.map(async (requestId): Promise<StatusResult> => {
      try {
        return { requestId, status: await client.status(requestId) }
      } catch (caught) {
        return {
          requestId,
          error: caught instanceof Error ? caught.message : String(caught),
        }
      }
    })
  )
}

export async function cancelGeneration(
  data: unknown
): Promise<ActionResult<null>> {
  try {
    const [requestId] = parseRequestIds(data)
    await createPlatformClient(await readCredentials()).cancel(requestId!)
    return { ok: true, value: null }
  } catch (caught) {
    return failure(caught)
  }
}

async function readStoredCredentials() {
  const jar = await cookies()
  return decodeCredentials(jar.get(PLATFORM_KEY_COOKIE)?.value)
}

async function readCredentials() {
  const stored = await readStoredCredentials()
  if (!stored) throw new MissingCredentialsError()
  const baseUrl = process.env.HF_API_BASE_URL
  if (!baseUrl) throw new Error("Missing HF_API_BASE_URL")
  return { ...stored, baseUrl }
}

function parseRequestIds(data: unknown): string[] {
  const payload = asObject(data, "Invalid status payload")
  const requestIds = payload.requestIds
  if (!Array.isArray(requestIds) || requestIds.length === 0) {
    throw new Error("Invalid request ids")
  }
  return requestIds.map((requestId) => {
    if (typeof requestId !== "string" || !requestId)
      throw new Error("Invalid request id")
    return requestId
  })
}

function asObject(data: unknown, message: string): Record<string, unknown> {
  if (data === null || typeof data !== "object" || Array.isArray(data))
    throw new Error(message)
  return data as Record<string, unknown>
}
