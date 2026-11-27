import { LoaderCircle } from "lucide-react";

export default function Loader({
  message = "Loading...",
  fullPage = false,
}) {
  return (
    <div
      className={`loader ${
        fullPage ? "loader-full-page" : ""
      }`}
      role="status"
    >
      <LoaderCircle
        size={34}
        className="spin"
        aria-hidden="true"
      />

      <p>{message}</p>
    </div>
  );
}