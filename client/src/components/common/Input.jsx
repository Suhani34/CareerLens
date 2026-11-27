import { useId } from "react";

export default function Input({
  label,
  id,
  error,
  hint,
  icon: Icon,
  suffix,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const descriptionId =
    error || hint
      ? `${inputId}-description`
      : undefined;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="form-label"
        >
          {label}

          {props.required && (
            <span className="required-mark">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={[
          "input-wrapper",
          Icon ? "input-has-icon" : "",
          suffix ? "input-has-suffix" : "",
          error ? "input-invalid" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Icon && (
          <Icon
            className="input-leading-icon"
            size={18}
            aria-hidden="true"
          />
        )}

        <input
          {...props}
          id={inputId}
          className="form-input"
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
        />

        {suffix && (
          <div className="input-suffix">
            {suffix}
          </div>
        )}
      </div>

      {(error || hint) && (
        <p
          id={descriptionId}
          className={
            error
              ? "field-error"
              : "field-hint"
          }
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}