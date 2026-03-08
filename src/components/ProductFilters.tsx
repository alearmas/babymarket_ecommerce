import { useMemo } from "react";
import type { CatalogItem } from "../domain/catalog";

type Props = {
  items: CatalogItem[];

  search: string;
  setSearch: (v: string) => void;

  brand: string | null;
  setBrand: (v: string | null) => void;

  size: string | null;
  setSize: (v: string | null) => void;
};

/**
 * Horizontal chip-style filters for brand and size.
 * Only renders a filter row if the items actually have more than 1 option.
 */
export default function ProductFilters({
  items,
  search,
  setSearch,
  brand,
  setBrand,
  size,
  setSize,
}: Props) {
  const brands = useMemo(() => {
    const set = new Set(items.map((i) => i.brand).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const sizes = useMemo(() => {
    const set = new Set(items.map((i) => i.size).filter((s): s is string => s != null));
    return Array.from(set).sort((a, b) => {
      // Try numeric sort first (for sizes like M, G, XG or 1, 2, 3)
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [items]);

  const showBrands = brands.length > 1;
  const showSizes = sizes.length > 1;

  return (
    <div className="filters">
      {/* --- Search bar --- */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto, marca..."
        />
        {search && (
          <button className="search-clear" type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>
      {showBrands && (
        <div className="filter-row">
          <span className="filter-label">Marca</span>
          <div className="filter-chips">
            <button
              type="button"
              className={`chip ${brand === null ? "chip--active" : ""}`}
              onClick={() => setBrand(null)}
            >
              Todas
            </button>
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                className={`chip ${brand === b ? "chip--active" : ""}`}
                onClick={() => setBrand(brand === b ? null : b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSizes && (
        <div className="filter-row">
          <span className="filter-label">Talle</span>
          <div className="filter-chips">
            <button
              type="button"
              className={`chip ${size === null ? "chip--active" : ""}`}
              onClick={() => setSize(null)}
            >
              Todos
            </button>
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip ${size === s ? "chip--active" : ""}`}
                onClick={() => setSize(size === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
