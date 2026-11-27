import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import AuthProvider from "./context/AuthProvider";

import App from "./App";

import "./index.css";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />

        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            duration: 3500,

            style: {
              background: "#ffffff",
              color: "#172039",
              fontSize: "13px",
              borderRadius: "12px",
              border: "1px solid #e5e7ef",
              padding: "14px 16px",
              boxShadow:
                "0 8px 24px rgba(23,32,57,0.10)",
            },

            success: {
              iconTheme: {
                primary: "#16835b",
                secondary: "#ffffff",
              },
            },

            error: {
              iconTheme: {
                primary: "#dc3545",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);