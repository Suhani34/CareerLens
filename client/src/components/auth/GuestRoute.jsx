import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import Loader from "../common/Loader";
import safeRedirect from "../../utils/safeRedirect";

export default function GuestRoute() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <Loader
        fullPage
        message="Checking authentication..."
      />
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to={safeRedirect(
          location.state?.from,
          "/profile"
        )}
        replace
      />
    );
  }

  return <Outlet />;
}