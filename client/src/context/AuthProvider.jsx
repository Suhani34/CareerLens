import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AuthContext from "./AuthContext";
import authService from "../services/authService";

const TOKEN_KEY = "careerlens_token";

export default function AuthProvider({
  children,
}) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [sessionError, setSessionError] =
    useState("");

  const generation = useRef(0);

  // Clear the local authenticated session
  const logout = useCallback(() => {
    generation.current += 1;

    localStorage.removeItem(TOKEN_KEY);

    setUser(null);
    setLoading(false);
    setSessionError("");
  }, []);

  // Store a successful login session
  const saveSession = useCallback(
    (data) => {
      if (!data?.token || !data?.user) {
        throw new Error(
          "Invalid authentication response"
        );
      }

      generation.current += 1;

      localStorage.setItem(
        TOKEN_KEY,
        data.token
      );

      setUser(data.user);
      setLoading(false);
      setSessionError("");

      return data.user;
    },
    []
  );

  // Restore or refresh the current session
  const refreshUser = useCallback(
    async (config = {}) => {
      const token =
        localStorage.getItem(TOKEN_KEY);

      const requestGeneration =
        generation.current;

      if (!token) {
        setUser(null);
        setSessionError("");
        return null;
      }

      try {
        const currentUser =
          await authService.getMe(config);

        if (
          requestGeneration !==
            generation.current ||
          localStorage.getItem(TOKEN_KEY) !==
            token ||
          config.signal?.aborted
        ) {
          return null;
        }

        setUser(currentUser);
        setSessionError("");

        return currentUser;
      } catch (error) {
        if (
          error.code === "ERR_CANCELED" ||
          config.signal?.aborted ||
          requestGeneration !==
            generation.current
        ) {
          return null;
        }

        if (
          error.response?.status === 401
        ) {
          logout();
        } else {
          setSessionError(
            "Unable to verify your session. Check your connection and try again."
          );
        }

        return null;
      }
    },
    [logout]
  );

  // Restore login after browser refresh
  useEffect(() => {
    const controller = new AbortController();

    const restoreSession = async () => {
      await refreshUser({
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setLoading(false);
      }
    };

    restoreSession();

    return () => controller.abort();
  }, [refreshUser]);

  // Handle expired or invalid JWT
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener(
      "careerlens:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "careerlens:unauthorized",
        handleUnauthorized
      );
    };
  }, [logout]);

  // Synchronize login/logout between browser tabs
  useEffect(() => {
    const handleStorage = async (event) => {
      if (
        event.key !== TOKEN_KEY &&
        event.key !== null
      ) {
        return;
      }

      generation.current += 1;

      const token =
        localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setUser(null);
        setLoading(false);
        setSessionError("");
        return;
      }

      setUser(null);
      setLoading(true);

      await refreshUser();

      setLoading(false);
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [refreshUser]);

  // Login through Express API
  const login = useCallback(
    async (credentials) => {
      const data =
        await authService.login(credentials);

      return saveSession(data);
    },
    [saveSession]
  );

  // Register through Express API
  const register = useCallback(
    async (credentials) => {
      const data =
        await authService.register(credentials);

      return saveSession(data);
    },
    [saveSession]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      sessionError,

      isAuthenticated: Boolean(user),

      login,
      register,
      logout,
      refreshUser,
    }),
    [
      user,
      loading,
      sessionError,
      login,
      register,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}