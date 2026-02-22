import { z } from "zod";

/**
 * Schema for a single inventory item as returned by the API.
 *
 * The backend computes salePrice server-side — no pricing logic in the client.
 * profitMargin is intentionally excluded from the schema so it never reaches
 * the frontend even if the API sends it.
 */
export const InventoryItemSchema = z.object({
  productID: z.string(),
  brand: z.string(),
  presentation: z.string(),
  size: z.string().optional(),
  unitsPerPackage: z.number().optional(),
  sizeUnit: z.string().optional(),
  stock: z.number(),
  minStock: z.number(),
  salePrice: z.number(),
  category: z.string(),
  subcategory: z.string().optional(),
  photo: z.string().optional(),
  supplier: z.string().optional(),
});

export const InventoryResponseSchema = z.object({
  products: z.array(InventoryItemSchema),
});

export type InventoryItemDTO = z.infer<typeof InventoryItemSchema>;
export type InventoryResponse = z.infer<typeof InventoryResponseSchema>;
