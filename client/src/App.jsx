import { useEffect, useState } from "react";
import {
  ScanEye,
  CheckCircle2,
  Server,
  Database,
  Monitor,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "./services/api";
import "./App.css";

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");
  const checkHealth = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/health");
      setHealth(response.data);
    } catch {
      setHealth(null);
      setError("Unable to connect to CareerLens API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/health", {
        signal: controller.signal,
      })
      .then((response) => {
        setHealth(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") {
          setError("Unable to connect to CareerLens API.");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();

    api
      .get("/stats", {
        signal: controller.signal,
      })
      .then((response) => {
        setStats(response.data.data);
        setStatsError("");
      })
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") {
          setStatsError(
            "Unable to load database statistics."
          );
        }
      });

    return () => controller.abort();
  }, []);
  
  const systems = [
    {
      name: "React Frontend",
      icon: Monitor,
      connected: true,
      description: "Vite + React",
    },
    {
      name: "Express Backend",
      icon: Server,
      connected: health?.server === "Running",
      description: "Node.js REST API",
    },
    {
      name: "MongoDB Database",
      icon: Database,
      connected: health?.database === "Connected",
      description: "MongoDB + Mongoose",
    },
  ];

  const allConnected = systems.every(
    (system) => system.connected
  );

  return (
    <main className="status-page">
      <section className="status-container">
        <div className="brand">
          <ScanEye size={36} />
          <span>CareerLens</span>
        </div>

        <div className="intro">
          <span className="eyebrow">
            CAREER INTELLIGENCE PLATFORM
          </span>

          <h1>Your future starts here.</h1>

          <p>
            AI-powered job discovery and personalized
            career recommendations.
          </p>
        </div>

        <div className="status-heading">
          <h2>System Status</h2>

          <button
            className="refresh-button"
            onClick={checkHealth}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Checking..." : "Refresh"}
          </button>
        </div>

        <div className="system-grid">
          {systems.map((system) => {
            const Icon = system.icon;

            return (
              <article
                className="system-card"
                key={system.name}
              >
                <Icon
                  className="system-icon"
                  size={28}
                />

                <h3>{system.name}</h3>
                <p>{system.description}</p>

                <div
                  className={
                    system.connected
                      ? "status online"
                      : "status offline"
                  }
                >
                  {system.connected ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}

                  {system.connected
                    ? "Connected"
                    : loading
                    ? "Checking..."
                    : "Disconnected"}
                </div>
              </article>
            );
          })}
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {allConnected && !loading && (
          <div className="success-message">
            <CheckCircle2 size={22} />

            <div>
              <strong>All systems operational</strong>

              <p>
                Frontend, backend and database are
                communicating successfully.
              </p>
            </div>
          </div>
        )}

        {statsError && (
  <div className="error-message">
    {statsError}
  </div>
)}

{stats && (
  <section className="database-section">
    <div className="database-heading">
      <span className="eyebrow">
        LIVE DATABASE
      </span>

      <h2>CareerLens Data Overview</h2>

      <p>
        Real-time database statistics retrieved
        through the Express REST API.
      </p>
    </div>

    <div className="database-grid">
      {[
        {
          label: "Job Opportunities",
          value: stats.jobs,
        },
        {
          label: "Companies",
          value: stats.companies,
        },
        {
          label: "Career Categories",
          value: stats.categories,
        },
        {
          label: "Career Articles",
          value: stats.articles,
        },
      ].map((item) => (
        <article
          className="database-card"
          key={item.label}
        >
          <h3>{item.value}</h3>
          <p>{item.label}</p>
        </article>
      ))}
    </div>
  </section>
)}

<footer>
  CareerLens · MERN Stack Project · Development
  Phase 2
</footer>
      </section>
    </main>
  );
}

export default App;