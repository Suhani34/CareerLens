import { Link } from "react-router-dom";

import {
  ArrowLeft,
  SearchX,
  BriefcaseBusiness,
} from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="not-found-page">
      <div className="container not-found-content">
        <div className="not-found-icon">
          <SearchX size={44} />
        </div>

        <span className="not-found-number">
          404
        </span>

        <h1>Page not found</h1>

        <p>
          The page you are looking for may have
          been moved or does not exist.
          Your next career opportunity is still
          waiting for you.
        </p>

        <div className="not-found-actions">
          <Link
            to="/"
            className="btn btn-primary btn-lg"
          >
            <ArrowLeft size={18} />
            Back to Homepage
          </Link>

          <Link
            to="/jobs"
            className="btn btn-outline btn-lg"
          >
            <BriefcaseBusiness size={18} />
            Browse Jobs
          </Link>
        </div>
      </div>
    </section>
  );
}