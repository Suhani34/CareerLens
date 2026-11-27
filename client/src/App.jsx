import {
  Routes,
  Route,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import ScrollToTop from "./components/layout/ScrollToTop";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";

// Authentication pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Public pages
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";

// Protected pages
import CandidateProfilePage from "./pages/CandidateProfilePage";
import SavedJobsPage from "./pages/SavedJobsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplyJobPage from "./pages/ApplyJobPage";
import AIDashboardPage from "./pages/AIDashboardPage";

// Error page
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Main website layout */}
        <Route element={<MainLayout />}>
          {/* Public pages */}
          <Route
            index
            element={<HomePage />}
          />

          <Route
            path="jobs"
            element={<JobsPage />}
          />

          <Route
            path="jobs/:slug"
            element={<JobDetailsPage />}
          />

          <Route
            path="companies"
            element={<CompaniesPage />}
          />

          <Route
            path="companies/:slug"
            element={<CompanyProfilePage />}
          />

          <Route
            path="about"
            element={<AboutPage />}
          />

          <Route
            path="blog"
            element={<BlogPage />}
          />

          <Route
            path="blog/:slug"
            element={<BlogDetailsPage />}
          />

          {/* Authenticated candidate pages */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="profile"
              element={<CandidateProfilePage />}
            />

            <Route
              path="saved-jobs"
              element={<SavedJobsPage />}
            />

            <Route
              path="applications"
              element={<ApplicationsPage />}
            />

            <Route
              path="apply/:jobId"
              element={<ApplyJobPage />}
            />

            <Route
              path="ai-dashboard"
              element={<AIDashboardPage />}
            />
          </Route>

          {/* Invalid website routes */}
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Route>

        {/* Authentication layout */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route
              path="login"
              element={<LoginPage />}
            />

            <Route
              path="register"
              element={<RegisterPage />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}