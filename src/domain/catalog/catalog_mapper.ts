import type { CatalogItem } from "./types";
import type { InventoryItemDTO } from "../../services/schemas";

/** Maps an API DTO to a CatalogItem domain model. */
export function toCatalogItem(dto: InventoryItemDTO): CatalogItem {
  const nameParts = [dto.brand, dto.presentation].filter(Boolean);
  const title = nameParts.join(" ").replace(/\s+/g, " ").trim();

  const size = dto.size ? `Talle ${dto.size}` : "";
  const pack =
    dto.unitsPerPackage != null
      ? `Pack ${dto.unitsPerPackage}${dto.sizeUnit === "UNIT" ? " u" : ` ${dto.sizeUnit}`}`
      : "";

  const subtitle = [size, pack].filter(Boolean).join(" · ");

  return {
    id: dto.productID,
    title,
    subtitle,
    category: dto.category,
    brand: dto.brand ?? "",
    size: dto.size ?? null,
    photo: sanitizePhoto(dto.photo),
    stock: dto.stock,
    salePrice: dto.salePrice,
  };
}

/**
 * Accepts HTTPS URLs and data: URIs (base64 images).
 * Rejects anything else (http:, javascript:, etc.).
 */
function sanitizePhoto(value: string | undefined): string | null {
  if (!value) return null;

  // Allow base64 data URIs for images
  if (value.startsWith("data:image/")) return value;

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}
