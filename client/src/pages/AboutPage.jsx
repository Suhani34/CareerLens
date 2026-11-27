import { Link } from "react-router-dom";

import {
  Search,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import PageHeader from "../components/common/PageHeader";

const pillars = [
  {
    icon: Search,
    title: "Meaningful job discovery",
    description:
      "Explore structured job listings with detailed information about skills, experience and compensation.",
  },

  {
    icon: BrainCircuit,
    title: "Career intelligence",
    description:
      "Our planned rule-based recommendation engine will analyze candidate interests and activity to suggest relevant roles.",
  },

  {
    icon: ShieldCheck,
    title: "Authenticated candidate workspace",
    description:
      "Candidate information and application documents are managed through protected backend APIs.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About CareerLens"
        title="A clearer perspective on your career"
        description="A full-stack academic project combining job discovery, candidate management and intelligent recommendations."
      />

      <section className="section">
        <div className="container">
          <div className="about-intro">
            <h2>Our purpose</h2>

            <p>
              CareerLens is designed to simplify
              the process of discovering career
              opportunities and managing the
              job-search journey.
            </p>

            <p>
              Built using MongoDB, Express.js,
              React and Node.js, the platform
              demonstrates how modern full-stack
              technologies can support a complete
              recruitment-oriented application.
            </p>
          </div>

          <div className="about-grid">
            {pillars.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <article
                  className="preview-panel"
                  key={title}
                >
                  <span className="stat-icon">
                    <Icon size={25} />
                  </span>

                  <h3>{title}</h3>

                  <p>{description}</p>
                </article>
              )
            )}
          </div>

          <div className="about-disclaimer">
            <h3>Academic demonstration</h3>

            <p>
              All company information and job
              opportunities are fictional.
              Recruitment decisions are simulated,
              and career recommendations are intended
              for exploration rather than actual
              hiring decisions.
            </p>

            <Link
              to="/jobs"
              className="btn btn-primary btn-md"
            >
              Explore CareerLens
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}