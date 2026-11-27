import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import Loader from "../common/Loader";
import Alert from "../common/Alert";
import Button from "../common/Button";

export default function ProtectedRoute() {
  const {
    isAuthenticated,
    loading,
    sessionError,
    refreshUser,
    logout,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <Loader
        fullPage
        message="Verifying your session..."
      />
    );
  }

  if (!isAuthenticated && sessionError) {
    return (
      <div className="container section">
        <Alert type="error">
          {sessionError}
        </Alert>

        <div className="inline-actions">
          <Button onClick={() => refreshUser()}>
            Try Again
          </Button>

          <Button
            variant="outline"
            onClick={logout}
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search +
            location.hash,
        }}
      />
    );
  }

  return <Outlet />;
}