import type { CatalogItem } from "../domain/catalog";
import { fmtARS } from "../domain/cart";

type Props = {
  items: CatalogItem[];
  onAdd: (id: string) => void;
};

export default function ProductList({ items, onAdd }: Props) {
  return (
    <div className="grid">
      {items.map((it) => {
        const out = it.stock <= 0;
        return (
          <div key={it.id} className="product">
            {/* --- Product image --- */}
            <div className="product-img-wrap">
              {it.photo ? (
                <img
                  className="product-img"
                  src={it.photo}
                  alt={it.title}
                  loading="lazy"
                />
              ) : (
                <div className="product-img-placeholder">📦</div>
              )}
            </div>

            {/* --- Product info --- */}
            <div>
              <div className="p-name">{it.title}</div>
              {it.subtitle && <div className="muted">{it.subtitle}</div>}
              <div className="muted">Stock: {it.stock}</div>
            </div>

            {/* --- Price & add --- */}
            <div className="row">
              <div className="sale-price">{fmtARS(it.salePrice)}</div>
              <button className="btn" type="button" disabled={out} onClick={() => onAdd(it.id)}>
                {out ? "Sin stock" : "Agregar"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
