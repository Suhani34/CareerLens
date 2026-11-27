import { Link } from "react-router-dom";
import { ScanEye } from "lucide-react";

export default function Logo({
  light = false,
}) {
  return (
    <Link
      to="/"
      className={`brand-logo ${
        light ? "brand-logo-light" : ""
      }`}
      aria-label="CareerLens homepage"
    >
      <span className="brand-icon">
        <ScanEye
          size={25}
          strokeWidth={2.1}
          aria-hidden="true"
        />
      </span>

      <span className="brand-name">
        Career<span>Lens</span>
      </span>
    </Link>
  );
}