import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductFilters from "./ProductFilters";
import type { CatalogItem } from "../domain/catalog";

const item = (overrides: Partial<CatalogItem>): CatalogItem => ({
  id: Math.random().toString(),
  title: "Producto",
  subtitle: "",
  category: "Pañales",
  brand: "Huggies",
  size: null,
  photo: null,
  stock: 5,
  salePrice: 1000,
  ...overrides,
});

function setup(items: CatalogItem[]) {
  const props = {
    items,
    search: "",
    setSearch: vi.fn(),
    category: null,
    setCategory: vi.fn(),
    brand: null,
    setBrand: vi.fn(),
    size: null,
    setSize: vi.fn(),
  };
  render(<ProductFilters {...props} />);
  return props;
}

describe("ProductFilters — category row", () => {
  it("renders a chip per distinct category, plus 'Todas'", () => {
    setup([item({ category: "Pañales" }), item({ category: "Higiene" }), item({ category: "Pañales" })]);
    expect(screen.getByRole("button", { name: "Todas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pañales" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Higiene" })).toBeInTheDocument();
  });

  it("calls setCategory with the clicked category", async () => {
    const user = userEvent.setup();
    const props = setup([item({ category: "Pañales" }), item({ category: "Higiene" })]);
    await user.click(screen.getByRole("button", { name: "Higiene" }));
    expect(props.setCategory).toHaveBeenCalledWith("Higiene");
  });

  it("does not render the category row when every item shares the same category", () => {
    setup([item({ category: "Pañales" }), item({ category: "Pañales" })]);
    expect(screen.queryByText("CATEGORÍA")).not.toBeInTheDocument();
  });

  it("toggles back to 'Todas' when the active category is clicked again", async () => {
    const user = userEvent.setup();
    const setCategory = vi.fn();
    render(
      <ProductFilters
        items={[item({ category: "Pañales" }), item({ category: "Higiene" })]}
        search=""
        setSearch={vi.fn()}
        category="Higiene"
        setCategory={setCategory}
        brand={null}
        setBrand={vi.fn()}
        size={null}
        setSize={vi.fn()}
      />
    );
    await user.click(screen.getByRole("button", { name: "Higiene" }));
    expect(setCategory).toHaveBeenCalledWith(null);
  });
});
