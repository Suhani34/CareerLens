import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      <Navbar />

      <main
        id="main-content"
        className="main-content"
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}