import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  Sparkles,
  Mail,
} from "lucide-react";

import Logo from "../common/Logo";

const footerGroups = [
  {
    heading: "Explore Careers",

    links: [
      { label: "Find Jobs", to: "/jobs" },
      { label: "Browse Companies", to: "/companies" },
      {
        label: "Remote Jobs",
        to: "/jobs?workMode=Remote",
      },
      {
        label: "Internships",
        to: "/jobs?jobType=Internship",
      },
    ],
  },

  {
    heading: "For Candidates",

    links: [
      { label: "My Profile", to: "/profile" },
      { label: "Saved Jobs", to: "/saved-jobs" },
      {
        label: "My Applications",
        to: "/applications",
      },
      {
        label: "AI Career Insights",
        to: "/ai-dashboard",
      },
    ],
  },

  {
    heading: "CareerLens",

    links: [
      { label: "About Us", to: "/about" },
      { label: "Career Advice", to: "/blog" },
      {
        label: "Resume Tips",
        to: "/blog?category=Resume%20Tips",
      },
      {
        label: "Interview Preparation",
        to: "/blog?category=Interview%20Preparation",
      },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo light />

            <p>
              Discover opportunities, build your
              professional profile and make
              informed career decisions with
              intelligent job recommendations.
            </p>

            <div className="footer-feature">
              <Sparkles size={16} />
              <span>
                Career discovery with intelligence
              </span>
            </div>

            <div className="footer-contact">
              <Mail size={16} />
              <span>Academic demonstration project</span>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div
              className="footer-column"
              key={group.heading}
            >
              <h3>{group.heading}</h3>

              {group.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>
            © {year} CareerLens. Built as a
            MERN stack academic project.
          </p>

          <Link to="/about">
            About this project
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <p className="footer-disclaimer">
          CareerLens contains fictional demonstration
          companies and job listings. Applications
          and recruitment outcomes are simulated.
        </p>
      </div>
    </footer>
  );
}