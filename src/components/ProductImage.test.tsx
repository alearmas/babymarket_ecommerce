import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductImage from "./ProductImage";

describe("ProductImage", () => {
  it("renders the placeholder when there is no src", () => {
    render(<ProductImage src={null} alt="Producto" placeholderClassName="ph" />);
    expect(screen.getByText("📦")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the image when a src is provided", () => {
    render(<ProductImage src="https://cdn.example.com/x.jpg" alt="Producto" />);
    expect(screen.getByRole("img", { name: "Producto" })).toHaveAttribute(
      "src",
      "https://cdn.example.com/x.jpg"
    );
  });

  it("falls back to the placeholder when the image fails to load", () => {
    render(<ProductImage src="https://cdn.example.com/broken.jpg" alt="Producto" placeholderClassName="ph" />);
    const img = screen.getByRole("img", { name: "Producto" });

    fireEvent.error(img);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("📦")).toBeInTheDocument();
  });
});
