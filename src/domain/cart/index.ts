import type { CatalogItem } from "../catalog";
import { calcShipping, FREE_SHIPPING_THRESHOLD } from "../pricing";
import { config } from "../../config";

export type Cart = Record<string, number>;

export type CartItem = {
  product: CatalogItem;
  qty: number;
};

export type PaymentMethod = "efectivo" | "transferencia";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
};

export { FREE_SHIPPING_THRESHOLD };

export const fmtARS = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export function buildCartItems(cart: Cart, items: CatalogItem[]): CartItem[] {
  const out: CartItem[] = [];
  for (const [id, qty] of Object.entries(cart)) {
    const product = items.find((p) => p.id === id);
    if (product && qty > 0) out.push({ product, qty });
  }
  return out;
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.product.salePrice * it.qty, 0);
}

export function calcTotalItems(items: CartItem[]): number {
  return items.reduce((acc, it) => acc + it.qty, 0);
}

export { calcShipping };

export function buildWhatsAppUrl(args: {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  neighborhood: string;
  note: string;
  paymentMethod: PaymentMethod;
}): string {
  const { cartItems, subtotal, shipping, neighborhood, note, paymentMethod } = args;
  const total = subtotal + shipping;

  const lines: string[] = [];
  lines.push("🛒 *Hola! Quiero hacer este pedido:*");
  lines.push("");

  cartItems.forEach(({ product, qty }) => {
    lines.push(`• ${qty} × ${product.title} — ${fmtARS(product.salePrice * qty)}`);
  });

  lines.push("");
  lines.push(`💰 *Subtotal:* ${fmtARS(subtotal)}`);

  if (shipping > 0) {
    lines.push(`📦 *Envío:* ${fmtARS(shipping)}`);
  } else {
    lines.push(`📦 *Envío:* GRATIS ✅`);
  }

  lines.push(`🧾 *Total:* ${fmtARS(total)}`);
  lines.push(`💳 *Método de pago:* ${PAYMENT_LABELS[paymentMethod]}`);

  if (neighborhood.trim()) {
    lines.push(`📍 *Dirección/Zona:* ${neighborhood.trim()}`);
  }

  if (note.trim()) {
    lines.push(`📝 *Nota:* ${note.trim()}`);
  }

  lines.push("");
  lines.push("¿Me confirmás stock y total final? 🙏");

  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
