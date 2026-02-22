import { config } from "../config";
import { InventoryResponseSchema, type InventoryItemDTO } from "./schemas";

const INVENTORY_URL = `${config.apiBaseUrl}/inventory`;

export type { InventoryItemDTO };

export async function fetchProducts(signal?: AbortSignal): Promise<InventoryItemDTO[]> {
  const res = await fetch(INVENTORY_URL, { signal });

  if (!res.ok) {
    console.error(`[catalog] fetch failed: ${res.status} ${res.statusText}`);
    throw new Error("No se pudo cargar el catálogo. Intentá de nuevo más tarde.");
  }

  const json: unknown = await res.json();
  const result = InventoryResponseSchema.safeParse(json);

  if (!result.success) {
    console.error("[catalog] invalid API response:", result.error.flatten());
    throw new Error("Respuesta inesperada del servidor.");
  }

  return result.data.products;
}
