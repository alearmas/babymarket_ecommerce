import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { fetchProducts } from "./services/catalog";
import type { InventoryItemDTO } from "./services/schemas";

vi.mock("./services/catalog", () => ({
  fetchProducts: vi.fn(),
}));

const dto = (overrides: Partial<InventoryItemDTO>): InventoryItemDTO => ({
  productID: Math.random().toString(),
  brand: "Huggies",
  presentation: "Natural Care",
  stock: 5,
  minStock: 1,
  salePrice: 1000,
  category: "Pañales",
  ...overrides,
});

async function renderWithCatalog(items: InventoryItemDTO[]) {
  vi.mocked(fetchProducts).mockResolvedValue(items);
  render(<App />);
  await waitFor(() => expect(screen.queryByText(/Cargando catálogo/)).not.toBeInTheDocument());
}

describe("App — catalog rendering", () => {
  it("sorts out-of-stock items after in-stock items", async () => {
    await renderWithCatalog([
      dto({ productID: "out-of-stock", presentation: "Sin stock", stock: 0 }),
      dto({ productID: "in-stock", presentation: "Con stock", stock: 5 }),
    ]);

    const names = screen.getAllByText(/Huggies (Sin|Con) stock/).map((el) => el.textContent);
    expect(names).toEqual(["Huggies Con stock", "Huggies Sin stock"]);
  });

  it("shows the 24-48hs badge only for out-of-stock items", async () => {
    await renderWithCatalog([
      dto({ productID: "a", presentation: "Disponible", stock: 3 }),
      dto({ productID: "b", presentation: "Agotado", stock: 0 }),
    ]);

    expect(screen.getAllByText(/Disponible en 24–48 hs/)).toHaveLength(1);
  });

  it("filters the grid by category", async () => {
    const user = userEvent.setup();
    await renderWithCatalog([
      dto({ productID: "a", presentation: "Toallitas", category: "Higiene" }),
      dto({ productID: "b", presentation: "Pañales RN", category: "Pañales" }),
    ]);

    expect(screen.getByText("Huggies Toallitas")).toBeInTheDocument();
    expect(screen.getByText("Huggies Pañales RN")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Higiene" }));

    expect(screen.getByText("Huggies Toallitas")).toBeInTheDocument();
    expect(screen.queryByText("Huggies Pañales RN")).not.toBeInTheDocument();
  });

  it("combines search with category filters", async () => {
    const user = userEvent.setup();
    await renderWithCatalog([
      dto({ productID: "a", presentation: "Toallitas húmedas", category: "Higiene" }),
      dto({ productID: "b", presentation: "Jabón líquido", category: "Higiene" }),
    ]);

    await user.type(screen.getByPlaceholderText("Buscar producto, marca..."), "toallitas");

    expect(screen.getByText("Huggies Toallitas húmedas")).toBeInTheDocument();
    expect(screen.queryByText("Huggies Jabón líquido")).not.toBeInTheDocument();
  });

  it("shows the empty state when no product matches the filters", async () => {
    const user = userEvent.setup();
    await renderWithCatalog([dto({ productID: "a", presentation: "Toallitas" })]);

    await user.type(screen.getByPlaceholderText("Buscar producto, marca..."), "producto inexistente");

    expect(screen.getByText("No hay productos con esos filtros.")).toBeInTheDocument();
  });

  it("shows an error message when the catalog fails to load", async () => {
    vi.mocked(fetchProducts).mockRejectedValue(new Error("No se pudo cargar el catálogo. Intentá de nuevo más tarde."));
    render(<App />);
    expect(await screen.findByText(/No se pudo cargar el catálogo/)).toBeInTheDocument();
  });
});

describe("App — cart", () => {
  it("updates the cart badge when a product is added", async () => {
    const user = userEvent.setup();
    await renderWithCatalog([dto({ productID: "a", presentation: "Toallitas" })]);

    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
