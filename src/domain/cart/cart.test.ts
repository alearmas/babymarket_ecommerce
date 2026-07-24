import { describe, expect, it } from "vitest";
import {
  buildCartItems,
  buildInquiryUrl,
  buildWhatsAppUrl,
  calcShipping,
  calcSubtotal,
  calcTotalItems,
  fmtARS,
  FREE_SHIPPING_THRESHOLD,
  type Cart,
} from "./index";
import type { CatalogItem } from "../catalog";

const product = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
  id: "p1",
  title: "Huggies Natural Care",
  subtitle: "Talle XG · Pack 52 u",
  category: "Pañales",
  brand: "Huggies",
  size: "XG",
  photo: null,
  stock: 10,
  salePrice: 1000,
  ...overrides,
});

describe("buildCartItems", () => {
  it("resolves cart quantities against the catalog", () => {
    const items = [product({ id: "p1" }), product({ id: "p2", salePrice: 2000 })];
    const cart: Cart = { p1: 2, p2: 1 };
    const result = buildCartItems(cart, items);
    expect(result).toHaveLength(2);
    expect(result.find((r) => r.product.id === "p1")?.qty).toBe(2);
  });

  it("drops entries for products no longer in the catalog", () => {
    const cart: Cart = { "missing-id": 3 };
    const result = buildCartItems(cart, [product({ id: "p1" })]);
    expect(result).toHaveLength(0);
  });

  it("drops entries with zero or negative quantity", () => {
    const cart: Cart = { p1: 0 };
    const result = buildCartItems(cart, [product({ id: "p1" })]);
    expect(result).toHaveLength(0);
  });
});

describe("calcSubtotal / calcTotalItems", () => {
  it("sums price × quantity across items", () => {
    const items = [
      { product: product({ salePrice: 1000 }), qty: 2 },
      { product: product({ salePrice: 500 }), qty: 3 },
    ];
    expect(calcSubtotal(items)).toBe(3500);
    expect(calcTotalItems(items)).toBe(5);
  });

  it("returns 0 for an empty cart", () => {
    expect(calcSubtotal([])).toBe(0);
    expect(calcTotalItems([])).toBe(0);
  });
});

describe("calcShipping", () => {
  it("charges the shipping fee below the free-shipping threshold", () => {
    expect(calcShipping(FREE_SHIPPING_THRESHOLD - 1)).toBeGreaterThan(0);
  });

  it("is free at or above the threshold", () => {
    expect(calcShipping(FREE_SHIPPING_THRESHOLD)).toBe(0);
    expect(calcShipping(FREE_SHIPPING_THRESHOLD + 10_000)).toBe(0);
  });
});

describe("buildWhatsAppUrl", () => {
  const baseArgs = {
    cartItems: [{ product: product({ title: "Huggies Natural Care", salePrice: 1000 }), qty: 2 }],
    subtotal: 2000,
    shipping: 1000,
    neighborhood: "Caballito",
    note: "",
    paymentMethod: "efectivo" as const,
  };

  it("encodes item lines, totals and neighborhood into the message", () => {
    const url = buildWhatsAppUrl(baseArgs);
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain("2 × Huggies Natural Care");
    expect(decoded).toContain("Caballito");
    expect(decoded).toContain("Efectivo");
    expect(decoded).toContain(fmtARS(3000)); // subtotal + shipping
  });

  it("marks shipping as free when shipping is 0", () => {
    const url = buildWhatsAppUrl({ ...baseArgs, shipping: 0 });
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain("GRATIS");
  });

  it("omits the note line when note is blank", () => {
    const url = buildWhatsAppUrl(baseArgs);
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).not.toContain("Nota:");
  });

  it("includes the note line when note is provided", () => {
    const url = buildWhatsAppUrl({ ...baseArgs, note: "Timbre roto" });
    const decoded = decodeURIComponent(url.split("?text=")[1]);
    expect(decoded).toContain("Timbre roto");
  });
});

describe("buildInquiryUrl", () => {
  it("encodes the free-text query into a WhatsApp link", () => {
    const url = buildInquiryUrl("Pañales Pampers talle 3 x 60");
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decodeURIComponent(url)).toContain("Pañales Pampers talle 3 x 60");
  });
});
