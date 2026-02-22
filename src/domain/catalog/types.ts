export type { InventoryItemDTO } from "../../services/schemas";

/**
 * Domain model for a product displayed in the catalog.
 *
 * costPrice is intentionally excluded — pricing margins are business-sensitive
 * and must not flow into client state. salePrice is the only price the UI needs.
 */
export type CatalogItem = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  brand: string;
  size: string | null;
  photo: string | null;
  stock: number;
  salePrice: number;
};
