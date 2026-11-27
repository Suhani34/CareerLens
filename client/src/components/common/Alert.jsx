import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

export default function Alert({
  type = "info",
  children,
}) {
  if (!children) return null;

  const Icon = icons[type] || Info;

  return (
    <div
      className={`alert alert-${type}`}
      role={
        type === "error"
          ? "alert"
          : "status"
      }
    >
      <Icon
        size={19}
        aria-hidden="true"
      />

      <div>{children}</div>
    </div>
  );
}