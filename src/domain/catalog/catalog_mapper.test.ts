import { describe, expect, it } from "vitest";
import { toCatalogItem } from "./catalog_mapper";
import type { InventoryItemDTO } from "../../services/schemas";

function makeDto(overrides: Partial<InventoryItemDTO> = {}): InventoryItemDTO {
  return {
    productID: "abc-123",
    brand: "Huggies",
    presentation: "Natural Care",
    stock: 10,
    minStock: 2,
    salePrice: 26700,
    category: "Pañales",
    ...overrides,
  };
}

describe("toCatalogItem", () => {
  it("builds the title from brand + presentation", () => {
    const item = toCatalogItem(makeDto());
    expect(item.title).toBe("Huggies Natural Care");
  });

  it("collapses extra whitespace when brand or presentation is missing", () => {
    const item = toCatalogItem(makeDto({ brand: "" as unknown as string, presentation: "Toallitas" }));
    expect(item.title).toBe("Toallitas");
  });

  it("translates known sizeUnit values to Spanish labels", () => {
    expect(toCatalogItem(makeDto({ unitsPerPackage: 40, sizeUnit: "SHEETS" })).subtitle).toContain("Pack 40 hojas");
    expect(toCatalogItem(makeDto({ unitsPerPackage: 200, sizeUnit: "GR" })).subtitle).toContain("Pack 200 gr");
    expect(toCatalogItem(makeDto({ unitsPerPackage: 500, sizeUnit: "ML" })).subtitle).toContain("Pack 500 ml");
    expect(toCatalogItem(makeDto({ unitsPerPackage: 52, sizeUnit: "UNIT" })).subtitle).toContain("Pack 52 u");
  });

  it("falls back to a lowercased raw unit for unknown sizeUnit values instead of leaking API casing", () => {
    const item = toCatalogItem(makeDto({ unitsPerPackage: 3, sizeUnit: "BOXES" }));
    expect(item.subtitle).toContain("Pack 3 boxes");
  });

  it("omits the pack segment entirely when unitsPerPackage is not provided", () => {
    const item = toCatalogItem(makeDto({ unitsPerPackage: undefined, sizeUnit: "GR" }));
    expect(item.subtitle).not.toContain("Pack");
  });

  it("includes the size segment when present", () => {
    const item = toCatalogItem(makeDto({ size: "XG", unitsPerPackage: 52, sizeUnit: "UNIT" }));
    expect(item.subtitle).toBe("Talle XG · Pack 52 u");
  });

  it("excludes costPrice-adjacent fields — only fields on CatalogItem are exposed", () => {
    const item = toCatalogItem(makeDto());
    expect(Object.keys(item).sort()).toEqual(
      ["brand", "category", "id", "photo", "salePrice", "size", "stock", "subtitle", "title"].sort()
    );
  });

  describe("photo sanitization (security)", () => {
    it("accepts https URLs", () => {
      const item = toCatalogItem(makeDto({ photo: "https://cdn.example.com/product.jpg" }));
      expect(item.photo).toBe("https://cdn.example.com/product.jpg");
    });

    it("accepts base64 data:image URIs", () => {
      const dataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";
      const item = toCatalogItem(makeDto({ photo: dataUri }));
      expect(item.photo).toBe(dataUri);
    });

    it("rejects http (non-https) URLs", () => {
      const item = toCatalogItem(makeDto({ photo: "http://cdn.example.com/product.jpg" }));
      expect(item.photo).toBeNull();
    });

    it("rejects javascript: URIs", () => {
      const item = toCatalogItem(makeDto({ photo: "javascript:alert(1)" }));
      expect(item.photo).toBeNull();
    });

    it("rejects malformed URLs instead of throwing", () => {
      const item = toCatalogItem(makeDto({ photo: "not a url" }));
      expect(item.photo).toBeNull();
    });

    it("returns null when no photo is provided", () => {
      const item = toCatalogItem(makeDto({ photo: undefined }));
      expect(item.photo).toBeNull();
    });
  });
});
