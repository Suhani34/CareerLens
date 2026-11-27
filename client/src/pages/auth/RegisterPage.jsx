import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";

import toast from "react-hot-toast";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";

import useAuth from "../../hooks/useAuth";

import getErrorMessage from "../../utils/getErrorMessage";
import safeRedirect from "../../utils/safeRedirect";

export default function RegisterPage() {
  const { register } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [acknowledged, setAcknowledged] =
    useState(false);

  const passwordChecks = [
    {
      label: "At least 8 characters",
      valid: form.password.length >= 8,
    },

    {
      label: "Contains an uppercase letter",
      valid: /[A-Z]/.test(form.password),
    },

    {
      label: "Contains a number",
      valid: /[0-9]/.test(form.password),
    },

    {
      label: "Contains a special character",
      valid: /[^A-Za-z0-9\s]/.test(
        form.password
      ),
    },
  ];

  const strength = passwordChecks.filter(
    (check) => check.valid
  ).length;

  const strengthLabels = [
    "",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "password"
        ? { confirmPassword: "" }
        : {}),
    }));

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name =
        "Full name is required.";
    } else if (
      form.name.trim().length > 100
    ) {
      nextErrors.name =
        "Name cannot exceed 100 characters.";
    }

    if (
      !/^\S+@\S+\.\S+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    } else if (
      new TextEncoder().encode(form.password)
        .length > 72
    ) {
      nextErrors.password =
        "Password must not exceed 72 UTF-8 bytes.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      form.confirmPassword !== form.password
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!acknowledged) {
      nextErrors.acknowledged =
        "Please acknowledge the demonstration notice.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || !validate()) {
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      await register({
        name: form.name.trim(),

        email:
          form.email.trim().toLowerCase(),

        password: form.password,
      });

      toast.success(
        "Your CareerLens account has been created!"
      );

      navigate(
        safeRedirect(
          location.state?.from,
          "/profile"
        ),

        { replace: true }
      );
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          "Unable to create your account."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const passwordToggle = (
    visible,
    setter,
    label
  ) => (
    <button
      type="button"
      className="icon-button"
      aria-label={
        visible
          ? `Hide ${label}`
          : `Show ${label}`
      }
      onClick={() =>
        setter((previous) => !previous)
      }
    >
      {visible ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  );

  return (
    <div className="auth-form register-form">
      <div className="auth-form-heading">
        <span className="eyebrow">
          START YOUR JOURNEY
        </span>

        <h2>Create your account</h2>

        <p>
          Take the next step toward your
          professional future.
        </p>
      </div>

      <Alert type="error">
        {serverError}
      </Alert>

      <form
        className="auth-fields"
        onSubmit={handleSubmit}
        noValidate
      >
        <Input
          label="Full name"
          name="name"
          type="text"
          icon={UserRound}
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
          maxLength={100}
          error={errors.name}
          disabled={submitting}
          required
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          maxLength={254}
          error={errors.email}
          disabled={submitting}
          required
        />

        <Input
          label="Password"
          name="password"
          type={
            showPassword
              ? "text"
              : "password"
          }
          icon={LockKeyhole}
          placeholder="Create a password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.password}
          disabled={submitting}
          required
          suffix={passwordToggle(
            showPassword,
            setShowPassword,
            "password"
          )}
        />

        {form.password && (
          <div className="password-strength">
            <div className="strength-heading">
              <span>
                Password strength
              </span>

              <strong>
                {strengthLabels[strength]}
              </strong>
            </div>

            <div
              className={`strength-track strength-${strength}`}
              aria-label={`Password strength: ${strengthLabels[strength]}`}
            >
              {[1, 2, 3, 4].map((item) => (
                <span
                  key={item}
                  className={
                    item <= strength
                      ? "strength-filled"
                      : ""
                  }
                />
              ))}
            </div>

            <div className="password-checks">
              {passwordChecks.map((check) => (
                <div
                  key={check.label}
                  className={
                    check.valid
                      ? "password-check-valid"
                      : ""
                  }
                >
                  {check.valid ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Circle size={14} />
                  )}

                  {check.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Confirm password"
          name="confirmPassword"
          type={
            showConfirm
              ? "text"
              : "password"
          }
          icon={LockKeyhole}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={submitting}
          required
          suffix={passwordToggle(
            showConfirm,
            setShowConfirm,
            "confirmed password"
          )}
        />

        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={acknowledged}
            disabled={submitting}
            onChange={(event) => {
              setAcknowledged(
                event.target.checked
              );

              setErrors((previous) => ({
                ...previous,
                acknowledged: "",
              }));
            }}
          />

          <span>
            I understand that CareerLens is an
            academic demonstration platform
            using fictional job listings and
            simulated recruitment outcomes.
          </span>
        </label>

        {errors.acknowledged && (
          <p
            className="field-error"
            role="alert"
          >
            {errors.acknowledged}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={submitting}
          icon={ArrowRight}
        >
          Create Account
        </Button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}

        <Link
          to="/login"
          state={location.state}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}