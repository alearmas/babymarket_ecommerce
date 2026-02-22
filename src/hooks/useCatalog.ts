import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../services/catalog";
import { toCatalogItem, type CatalogItem } from "../domain/catalog";

export function useCatalog() {
  const [raw, setRaw] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const dto = await fetchProducts(controller.signal);
        setRaw(dto.map(toCatalogItem));
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setError((e as Error).message ?? "Error desconocido");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(raw.map((x) => x.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [raw]);

  return { items: raw, categories, loading, error };
}
