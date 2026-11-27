import {
  Link,
  Outlet,
} from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Bookmark,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import Logo from "../common/Logo";

const features = [
  {
    icon: BriefcaseBusiness,
    title: "Discover opportunities",
    description:
      "Explore roles across multiple career categories.",
  },

  {
    icon: Bookmark,
    title: "Organize your job search",
    description:
      "Save opportunities and track your applications.",
  },

  {
    icon: Sparkles,
    title: "Intelligent career insights",
    description:
      "Discover roles based on your professional interests.",
  },
];

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <aside className="auth-brand-panel">
        <div className="auth-decoration decoration-one" />
        <div className="auth-decoration decoration-two" />

        <div className="auth-brand-top">
          <Logo light />
        </div>

        <div className="auth-brand-content">
          <span className="auth-brand-tag">
            <Sparkles size={15} />
            BUILD YOUR NEXT CHAPTER
          </span>

          <h1>
            Your ambition.
            <br />
            Your future.
          </h1>

          <p className="auth-brand-description">
            Discover meaningful opportunities,
            build your confidence and take
            control of your professional journey.
          </p>

          <div className="auth-feature-list">
            {features.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <div
                  className="auth-feature"
                  key={title}
                >
                  <div className="auth-feature-icon">
                    <Icon size={21} />
                  </div>

                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              )
            )}
          </div>

          <div
            className="auth-insight-card"
            aria-hidden="true"
          >
            <div className="insight-card-heading">
              <div className="insight-icon">
                <TrendingUp size={23} />
              </div>

              <div>
                <strong>Your career journey</strong>
                <p>One step at a time</p>
              </div>

              <CheckCircle2
                className="insight-check"
                size={21}
              />
            </div>

            <div className="insight-progress">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <p className="insight-caption">
              Discover. Develop. Achieve.
            </p>
          </div>
        </div>

        <div className="auth-brand-footer">
          Your career. A clearer perspective.
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-top">
          <div className="auth-mobile-logo">
            <Logo />
          </div>

          <Link
            to="/"
            className="back-home-link"
          >
            <ArrowLeft size={17} />
            Back to homepage
          </Link>
        </div>

        <div className="auth-form-container">
          <Outlet />
        </div>

        <p className="auth-page-footer">
          CareerLens · Academic demonstration platform
        </p>
      </main>
    </div>
  );
}