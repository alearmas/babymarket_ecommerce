type Props = {
  categories: string[];
  onSelect: (category: string) => void;
};

export default function CategoryGrid({ categories, onSelect }: Props) {
  return (
    <div className="grid">
      {categories.map((c) => (
        <button key={c} className="category-card" type="button" onClick={() => onSelect(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}
