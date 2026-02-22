import { useMemo, useState } from "react";
import "./App.css";
import { useCatalog } from "./hooks/useCatalog";
import CategoryGrid from "./components/CategoryGrid";
import ProductList from "./components/ProductList";
import ProductFilters from "./components/ProductFilters";
import CartModal from "./components/CartModal";
import {
  type Cart,
  type PaymentMethod,
  buildCartItems,
  calcSubtotal,
  calcTotalItems,
  calcShipping,
  buildWhatsAppUrl,
  fmtARS,
  FREE_SHIPPING_THRESHOLD,
} from "./domain/cart";

export default function App() {
  const { items, categories, loading, error } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filters
  const [filterBrand, setFilterBrand] = useState<string | null>(null);
  const [filterSize, setFilterSize] = useState<string | null>(null);

  // Cart
  const [cart, setCart] = useState<Cart>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [neighborhood, setNeighborhood] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  // Items in the selected category (before brand/size filters)
  const categoryItems = useMemo(
    () => (selectedCategory ? items.filter((i) => i.category === selectedCategory) : []),
    [items, selectedCategory]
  );

  // Items after applying brand + size filters
  const visibleItems = useMemo(() => {
    let filtered = categoryItems;
    if (filterBrand) filtered = filtered.filter((i) => i.brand === filterBrand);
    if (filterSize) filtered = filtered.filter((i) => i.size === filterSize);
    return filtered;
  }, [categoryItems, filterBrand, filterSize]);

  const cartItems = useMemo(() => buildCartItems(cart, items), [cart, items]);
  const subtotal = useMemo(() => calcSubtotal(cartItems), [cartItems]);
  const shipping = useMemo(() => calcShipping(subtotal), [subtotal]);
  const totalItems = useMemo(() => calcTotalItems(cartItems), [cartItems]);

  if (loading) return <div className="page center">Cargando catálogo…</div>;
  if (error) return <div className="page center">{error}</div>;

  const addToCart = (id: string) => setCart((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));

  const decrementItem = (id: string) =>
    setCart((p) => {
      const next = { ...p };
      if (next[id] > 1) next[id]--;
      return next;
    });

  const removeItem = (id: string) =>
    setCart((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });

  const clear = () => setCart({});

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setFilterBrand(null);
    setFilterSize(null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setFilterBrand(null);
    setFilterSize(null);
  };

  const sendWhatsApp = () => {
    if (cartItems.length === 0)
      return alert("Agregá al menos un producto antes de enviar el pedido.");
    if (!neighborhood.trim())
      return alert("Ingresá una dirección o zona de entrega.");
    const url = buildWhatsAppUrl({ cartItems, subtotal, shipping, neighborhood, note, paymentMethod });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div>
            <div className="brand">BabyMarket</div>
            <div className="sub">{selectedCategory ?? "Elegí una categoría"}</div>
          </div>
          <button className="cart-btn" type="button" onClick={() => setIsCartOpen(true)}>
            🛒 <span className="cart-badge">{totalItems}</span>
          </button>
        </div>
      </header>

      {/* --- Free shipping global banner --- */}
      <div className="promo-banner">
        🚚 Envío gratis en compras desde {fmtARS(FREE_SHIPPING_THRESHOLD)}
      </div>

      <main className="main">
        <section className="card">
          {!selectedCategory ? (
            <>
              <div className="section-header">
                <h2 className="m-0">Categorías</h2>
              </div>
              <CategoryGrid categories={categories} onSelect={handleSelectCategory} />
            </>
          ) : (
            <>
              <div className="section-header">
                <button className="btn2" type="button" onClick={handleBack}>
                  ← Volver
                </button>
                <h2 className="m-0">{selectedCategory}</h2>
              </div>

              <ProductFilters
                items={categoryItems}
                brand={filterBrand}
                setBrand={setFilterBrand}
                size={filterSize}
                setSize={setFilterSize}
              />

              {visibleItems.length === 0 ? (
                <div className="empty-state">
                  <p className="muted">No hay productos con esos filtros.</p>
                </div>
              ) : (
                <ProductList items={visibleItems} onAdd={addToCart} />
              )}
            </>
          )}
        </section>
      </main>

      <CartModal
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        subtotal={subtotal}
        shipping={shipping}
        neighborhood={neighborhood}
        setNeighborhood={setNeighborhood}
        note={note}
        setNote={setNote}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onIncrement={addToCart}
        onDecrement={decrementItem}
        onRemove={removeItem}
        onClear={clear}
        onSendWhatsApp={sendWhatsApp}
      />
    </div>
  );
}
