import { describe, expect, it } from "vitest";
import { InventoryItemSchema, InventoryResponseSchema } from "./schemas";

const validItem = {
  productID: "abc-123",
  brand: "Huggies",
  presentation: "Natural Care",
  stock: 10,
  minStock: 2,
  salePrice: 26700,
  category: "Pañales",
};

describe("InventoryItemSchema", () => {
  it("accepts a minimal valid item", () => {
    expect(InventoryItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("accepts optional fields when present", () => {
    const result = InventoryItemSchema.safeParse({
      ...validItem,
      size: "XG",
      unitsPerPackage: 52,
      sizeUnit: "UNIT",
      subcategory: "Pañales de Bebé",
      photo: "https://cdn.example.com/x.jpg",
      supplier: "Proveedor SRL",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an item missing required fields", () => {
    const withoutBrand: Record<string, unknown> = { ...validItem };
    delete withoutBrand.brand;
    expect(InventoryItemSchema.safeParse(withoutBrand).success).toBe(false);
  });

  it("rejects wrong types (stock as string)", () => {
    expect(InventoryItemSchema.safeParse({ ...validItem, stock: "10" }).success).toBe(false);
  });

  it("strips profitMargin even if the backend sends it — margins must never reach the client", () => {
    const result = InventoryItemSchema.safeParse({ ...validItem, profitMargin: 25 });
    expect(result.success).toBe(true);
    expect(result.success && "profitMargin" in result.data).toBe(false);
  });
});

describe("InventoryResponseSchema", () => {
  it("accepts a well-formed products array", () => {
    const result = InventoryResponseSchema.safeParse({ products: [validItem] });
    expect(result.success).toBe(true);
  });

  it("rejects a response where one product is malformed", () => {
    const result = InventoryResponseSchema.safeParse({ products: [validItem, { brand: "Only brand" }] });
    expect(result.success).toBe(false);
  });

  it("rejects a response missing the products key entirely", () => {
    expect(InventoryResponseSchema.safeParse({}).success).toBe(false);
  });
});
