import type { CatalogItem } from "./types";
import type { InventoryItemDTO } from "../../services/schemas";

/** Spanish labels for the sizeUnit values used by inventory-service. */
const SIZE_UNIT_LABELS: Record<string, string> = {
  UNIT: "u",
  SHEETS: "hojas",
  ML: "ml",
  GR: "gr",
};

/** Maps an API DTO to a CatalogItem domain model. */
export function toCatalogItem(dto: InventoryItemDTO): CatalogItem {
  const nameParts = [dto.brand, dto.presentation].filter(Boolean);
  const title = nameParts.join(" ").replace(/\s+/g, " ").trim();

  const size = dto.size ? `Talle ${dto.size}` : "";
  const unitLabel = dto.sizeUnit ? SIZE_UNIT_LABELS[dto.sizeUnit] ?? dto.sizeUnit.toLowerCase() : "";
  const pack = dto.unitsPerPackage != null ? `Pack ${dto.unitsPerPackage} ${unitLabel}`.trim() : "";

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
