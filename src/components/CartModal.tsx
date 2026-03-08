import { useEffect } from "react";
import {
  fmtARS,
  PAYMENT_LABELS,
  FREE_SHIPPING_THRESHOLD,
  type CartItem,
  type PaymentMethod,
} from "../domain/cart";

type Props = {
  open: boolean;
  onClose: () => void;

  cartItems: CartItem[];
  subtotal: number;
  shipping: number;

  neighborhood: string;
  setNeighborhood: (v: string) => void;

  note: string;
  setNote: (v: string) => void;

  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;

  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;

  onClear: () => void;
  onSendWhatsApp: () => void;
};

export default function CartModal({
  open,
  onClose,
  cartItems,
  subtotal,
  shipping,
  neighborhood,
  setNeighborhood,
  note,
  setNote,
  paymentMethod,
  setPaymentMethod,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onSendWhatsApp,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const total = subtotal + shipping;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const missingForFree = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
      >
        {/* --- Drag handle --- */}
        <div className="modal-handle" />

        <div className="modal-header">
          <h2 className="m-0">Tu pedido 🛍️</h2>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-cart-icon">🛒</span>
            <p className="empty-cart-title">Tu carrito está vacío</p>
            <p className="muted">Agregá productos para empezar tu pedido</p>
          </div>
        ) : (
          <div className="stack">
            {/* --- Free shipping progress --- */}
            <div className="shipping-progress-wrap">
              <div className="shipping-progress-header">
                {shipping === 0 ? (
                  <span className="shipping-progress-label shipping-progress-label--free">
                    🚚 ¡Tenés envío gratis!
                  </span>
                ) : (
                  <span className="shipping-progress-label">
                    🚚 Sumá <strong>{fmtARS(missingForFree)}</strong> más para envío gratis
                  </span>
                )}
              </div>
              <div className="shipping-progress-track">
                <div
                  className="shipping-progress-fill"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            {/* --- Cart items list --- */}
            <div className="cart-items-list">
              {cartItems.map(({ product, qty }) => (
                <div key={product.id} className="cart-item">
                  {/* Thumbnail */}
                  <div className="cart-item-thumb">
                    {product.photo ? (
                      <img src={product.photo} alt={product.title} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-name">{product.title}</div>
                    <div className="muted">{fmtARS(product.salePrice)} c/u</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-item-price">{fmtARS(product.salePrice * qty)}</div>
                    <div className="qty-row">
                      <button
                        className="qty-btn"
                        type="button"
                        onClick={() => (qty === 1 ? onRemove(product.id) : onDecrement(product.id))}
                        aria-label="Reducir cantidad"
                      >
                        {qty === 1 ? "🗑" : "−"}
                      </button>
                      <span className="qty-value">{qty}</span>
                      <button
                        className="qty-btn"
                        type="button"
                        onClick={() => onIncrement(product.id)}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Totals --- */}
            <div className="totals-card">
              <div className="totals-line">
                <span className="muted">Subtotal</span>
                <span>{fmtARS(subtotal)}</span>
              </div>
              <div className="totals-line">
                <span className="muted">Envío</span>
                <span className={shipping === 0 ? "shipping-free-text" : ""}>
                  {shipping === 0 ? "GRATIS ✅" : fmtARS(shipping)}
                </span>
              </div>
              <div className="totals-line totals-line--total">
                <span>Total</span>
                <span className="total">{fmtARS(total)}</span>
              </div>
            </div>

            {/* --- Payment method --- */}
            <div className="field">
              <label className="field-label">Método de pago</label>
              <div className="payment-options">
                {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={`payment-btn ${paymentMethod === method ? "payment-btn--active" : ""}`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    <span className="payment-btn-icon">
                      {method === "efectivo" ? "💵" : "🏦"}
                    </span>
                    <span>{PAYMENT_LABELS[method]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* --- Address --- */}
            <div className="field">
              <label className="field-label">📍 Dirección / Zona de entrega</label>
              <input
                className="input"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ej: Av. Rivadavia 1234, Caballito"
              />
            </div>

            {/* --- Note --- */}
            <div className="field">
              <label className="field-label">📝 Nota (opcional)</label>
              <textarea
                className="textarea"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: timbre roto, llamar al llegar"
              />
            </div>

            {/* --- Actions --- */}
            <div className="cart-actions-v2">
              <button className="btn-whatsapp" type="button" onClick={onSendWhatsApp}>
                <span className="btn-whatsapp-icon">💬</span>
                Enviar pedido por WhatsApp
              </button>
              <button className="btn-clear" type="button" onClick={onClear}>
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
