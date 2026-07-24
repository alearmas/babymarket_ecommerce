import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CartModal from "./CartModal";
import type { CartItem } from "../domain/cart";
import type { CatalogItem } from "../domain/catalog";

const product: CatalogItem = {
  id: "p1",
  title: "Huggies Natural Care",
  subtitle: "Talle XG · Pack 52 u",
  category: "Pañales",
  brand: "Huggies",
  size: "XG",
  photo: null,
  stock: 5,
  salePrice: 1000,
};

const baseProps = {
  open: true,
  onClose: vi.fn(),
  subtotal: 2000,
  shipping: 1000,
  neighborhood: "",
  setNeighborhood: vi.fn(),
  note: "",
  setNote: vi.fn(),
  paymentMethod: "efectivo" as const,
  setPaymentMethod: vi.fn(),
  onIncrement: vi.fn(),
  onDecrement: vi.fn(),
  onRemove: vi.fn(),
  onClear: vi.fn(),
  onSendWhatsApp: vi.fn(),
};

describe("CartModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<CartModal {...baseProps} open={false} cartItems={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the empty state and hides the action footer when the cart has no items", () => {
    render(<CartModal {...baseProps} cartItems={[]} />);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Enviar pedido por WhatsApp/ })).not.toBeInTheDocument();
  });

  it("always renders the WhatsApp and clear buttons outside the scrollable body, so they can't be clipped", () => {
    const cartItems: CartItem[] = [{ product, qty: 2 }];
    const { container } = render(<CartModal {...baseProps} cartItems={cartItems} />);

    const actions = container.querySelector(".cart-actions-v2");
    const body = container.querySelector(".modal-body");
    expect(actions).toBeInTheDocument();
    expect(body).toBeInTheDocument();
    // The pinned footer must be a sibling of the scrollable body, not nested inside it —
    // otherwise it scrolls away with the content instead of staying visible.
    expect(body?.contains(actions)).toBe(false);
  });

  it("calls onSendWhatsApp when the WhatsApp button is clicked", async () => {
    const onSendWhatsApp = vi.fn();
    render(<CartModal {...baseProps} cartItems={[{ product, qty: 1 }]} onSendWhatsApp={onSendWhatsApp} />);
    screen.getByRole("button", { name: /Enviar pedido por WhatsApp/ }).click();
    expect(onSendWhatsApp).toHaveBeenCalled();
  });

  it("calls onClear when 'Vaciar carrito' is clicked", async () => {
    const onClear = vi.fn();
    render(<CartModal {...baseProps} cartItems={[{ product, qty: 1 }]} onClear={onClear} />);
    screen.getByRole("button", { name: "Vaciar carrito" }).click();
    expect(onClear).toHaveBeenCalled();
  });

  it("removes the item (rather than decrementing) when quantity is 1", () => {
    const onRemove = vi.fn();
    const onDecrement = vi.fn();
    render(
      <CartModal
        {...baseProps}
        cartItems={[{ product, qty: 1 }]}
        onRemove={onRemove}
        onDecrement={onDecrement}
      />
    );
    screen.getByRole("button", { name: "Reducir cantidad" }).click();
    expect(onRemove).toHaveBeenCalledWith("p1");
    expect(onDecrement).not.toHaveBeenCalled();
  });
});
