import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Alert from "../../components/common/Alert";

import useAuth from "../../hooks/useAuth";

import getErrorMessage from "../../utils/getErrorMessage";
import safeRedirect from "../../utils/safeRedirect";

export default function LoginPage() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password =
        "Password is required.";
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
      const user = await login({
        email:
          form.email.trim().toLowerCase(),

        password: form.password,
      });

      toast.success(
        `Welcome back, ${user.name.split(" ")[0]}!`
      );

      navigate(
        safeRedirect(
          location.state?.from,
          "/profile"
        ),

        {
          replace: true,
        }
      );
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          "Unable to sign in."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-form-heading">
        <span className="eyebrow">
          WELCOME TO CAREERLENS
        </span>

        <h2>Welcome back</h2>

        <p>
          Sign in to continue your career journey.
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
          label="Email address"
          name="email"
          type="email"
          icon={Mail}
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
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
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password}
          disabled={submitting}
          required
          suffix={
            <button
              type="button"
              className="icon-button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowPassword(
                  (visible) => !visible
                )
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          icon={ArrowRight}
        >
          Sign In
        </Button>
      </form>

      <p className="auth-switch">
        New to CareerLens?{" "}

        <Link
          to="/register"
          state={location.state}
        >
          Create an account
        </Link>
      </p>

      <div className="auth-security-note">
        <ShieldCheck size={17} />

        <p>
          Your account is protected by
          authenticated access and password hashing.
        </p>
      </div>
    </div>
  );
}