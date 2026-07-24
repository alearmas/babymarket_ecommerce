import type { CatalogItem } from "../domain/catalog";
import { fmtARS } from "../domain/cart";
import ProductImage from "./ProductImage";

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
              <ProductImage
                src={it.photo}
                alt={it.title}
                imgClassName="product-img"
                placeholderClassName="product-img-placeholder"
              />
            </div>

            {/* --- Product info --- */}
            <div>
              <div className="p-name">{it.title}</div>
              {it.subtitle && <div className="muted">{it.subtitle}</div>}
              {out && <div className="preorder-badge">Disponible en 24–48 hs</div>}
            </div>

            {/* --- Price & add --- */}
            <div className="row">
              <div className="sale-price">{fmtARS(it.salePrice)}</div>
              <button className="btn" type="button" onClick={() => onAdd(it.id)}>
                {out ? "Solicitar" : "Agregar"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
