import { LoaderCircle } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = "",
  ...props
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "btn-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <LoaderCircle
          size={18}
          className="spin"
          aria-hidden="true"
        />
      ) : (
        Icon && (
          <Icon
            size={18}
            aria-hidden="true"
          />
        )
      )}

      <span>
        {loading ? "Please wait..." : children}
      </span>
    </button>
  );
}