import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

// Match the extensionless TypeScript imports accepted by Next.js.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error.code !== "ERR_MODULE_NOT_FOUND" || !specifier.startsWith(".")) throw error;
      return nextResolve(`${specifier}.ts`, context);
    }
  },
});

const { createPlatformClient } = await import("../generation/platform.ts");

function client(status, body) {
  return createPlatformClient({
    apiKey: "test_api_key",
    baseUrl: "https://api.higgsfield.ai",
    fetch: async () => Response.json(body, { status }),
  });
}

// Lo que ve la persona en el dock cuando Higgsfield contesta con error: los codigos
// conocidos se explican en espanol y el codigo HTTP viaja en el error.
test("not_enough_credits se explica en espanol y conserva el 403", async () => {
  await assert.rejects(
    () => client(403, { detail: "not_enough_credits" }).submit("soul-2", { prompt: "x" }),
    (error) => error.status === 403 && /creditos suficientes/.test(error.message)
  );
});

test("un codigo desconocido se acompana del texto del status", async () => {
  await assert.rejects(
    () => client(503, { detail: "model_unavailable" }).submit("soul-2", { prompt: "x" }),
    (error) => /no esta disponible/.test(error.message) && /model_unavailable/.test(error.message)
  );
});

test("un detail con texto libre se muestra tal cual", async () => {
  await assert.rejects(
    () => client(422, { detail: "prompt is too long" }).submit("soul-2", { prompt: "x" }),
    (error) => error.message === "prompt is too long"
  );
});

test("sin detail se usa el texto del codigo HTTP", async () => {
  await assert.rejects(
    () => client(401, {}).submit("soul-2", { prompt: "x" }),
    (error) => /no reconoce la API key/.test(error.message)
  );
});
