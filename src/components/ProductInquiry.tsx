import { useState } from "react";
import { buildInquiryUrl } from "../domain/cart";

export default function ProductInquiry() {
  const [query, setQuery] = useState("");

  const handleSend = () => {
    if (!query.trim()) return alert("Describí el producto que estás buscando.");
    const url = buildInquiryUrl(query);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="inquiry-section">
      <div className="inquiry-icon">🔍</div>
      <h3 className="inquiry-title">¿No encontrás lo que buscás?</h3>
      <p className="inquiry-desc">
        Contanos qué producto necesitás y te avisamos si podemos conseguirlo.
      </p>
      <div className="inquiry-row">
        <input
          className="input"
          type="text"
          placeholder="Ej: Pañales Pampers talle 3 x 60 unidades"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="btn3 inquiry-btn" type="button" onClick={handleSend}>
          Consultar
        </button>
      </div>
    </section>
  );
}
