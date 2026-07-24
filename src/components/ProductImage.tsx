import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  imgClassName?: string;
  placeholderClassName?: string;
};

/**
 * Renders a product photo, falling back to the 📦 placeholder both when
 * there's no photo at all and when the photo URL fails to load (dead link,
 * 404, etc.) — otherwise a broken photo shows the browser's broken-image icon.
 */
export default function ProductImage({ src, alt, imgClassName, placeholderClassName }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={placeholderClassName}>📦</div>;
  }

  return (
    <img className={imgClassName} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}
