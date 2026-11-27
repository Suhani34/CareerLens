import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Layers3,
  BookOpen,
  Sparkles,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import api from "../services/api";

import useAuth from "../hooks/useAuth";

import Alert from "../components/common/Alert";
import Loader from "../components/common/Loader";

import getErrorMessage from "../utils/getErrorMessage";

export default function HomePage() {
  const {
    isAuthenticated,
    user,
  } = useAuth();

  const [stats, setStats] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadStats = async () => {
      try {
        const response = await api.get(
          "/stats",
          {
            signal: controller.signal,
          }
        );

        setStats(response.data.data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load platform statistics."
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => controller.abort();
  }, []);

  const metrics = [
    {
      label: "Job Opportunities",
      value: stats?.jobs,
      icon: BriefcaseBusiness,
    },

    {
      label: "Companies",
      value: stats?.companies,
      icon: Building2,
    },

    {
      label: "Career Categories",
      value: stats?.categories,
      icon: Layers3,
    },

    {
      label: "Career Articles",
      value: stats?.articles,
      icon: BookOpen,
    },
  ];

  return (
    <>
      <section className="foundation-hero">
        <div className="container foundation-hero-grid">
          <div className="foundation-hero-content">
            <div className="hero-tag">
              <Sparkles size={16} />
              A smarter approach to career discovery
            </div>

            <h1>
              Discover opportunities.
              <br />
              <span>Build your future.</span>
            </h1>

            <p>
              CareerLens connects job discovery,
              professional development and intelligent
              career insights in one powerful platform.
            </p>

            {isAuthenticated && (
              <div className="hero-welcome">
                Welcome back, {user.name}.
              </div>
            )}

            <div className="hero-actions">
              <Link
                to="/jobs"
                className="btn btn-primary btn-lg"
              >
                Explore Jobs
                <ArrowRight size={18} />
              </Link>

              <Link
                to={
                  isAuthenticated
                    ? "/ai-dashboard"
                    : "/register"
                }
                className="btn btn-outline btn-lg"
              >
                {isAuthenticated
                  ? "My Career Insights"
                  : "Create Free Account"}
              </Link>
            </div>

            <div className="hero-disclaimer">
              <ShieldCheck size={16} />
              Fictional listings for academic demonstration
            </div>
          </div>

          <div className="foundation-hero-visual">
            <div className="hero-visual-top">
              <span className="hero-visual-icon">
                <Search size={24} />
              </span>

              <div>
                <strong>Career discovery</strong>
                <p>Explore your possibilities</p>
              </div>
            </div>

            {[
              {
                icon: BriefcaseBusiness,
                title: "Find the right role",
                description:
                  "Explore jobs across career categories",
              },
              {
                icon: Building2,
                title: "Discover companies",
                description:
                  "Explore workplaces and industries",
              },
              {
                icon: TrendingUp,
                title: "Plan your next step",
                description:
                  "Understand your career interests",
              },
            ].map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <div
                  key={title}
                  className="hero-visual-card"
                >
                  <span>
                    <Icon size={22} />
                  </span>

                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="visual-card-arrow"
                  />
                </div>
              )
            )}

            <div className="hero-visual-bottom">
              <Sparkles size={18} />

              <p>
                Your career journey,
                with a clearer perspective.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-intro text-center">
            <span className="eyebrow">
              EXPLORE THE PLATFORM
            </span>

            <h2>Opportunities at your fingertips</h2>

            <p>
              Discover the CareerLens database,
              updated directly from our backend.
            </p>
          </div>

          {loading && (
            <Loader message="Loading platform statistics..." />
          )}

          <Alert type="error">
            {error}
          </Alert>

          {stats && (
            <div className="foundation-stats">
              {metrics.map(
                ({
                  label,
                  value,
                  icon: Icon,
                }) => (
                  <article
                    key={label}
                    className="stat-card"
                  >
                    <span className="stat-icon">
                      <Icon size={24} />
                    </span>

                    <strong>{value}</strong>

                    <p>{label}</p>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}