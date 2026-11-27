import { Link } from "react-router-dom";

import {
  UserRound,
  Mail,
  MapPin,
  Phone,
  FileText,
  Bookmark,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";

import useAuth from "../hooks/useAuth";
import PageHeader from "../components/common/PageHeader";
import Alert from "../components/common/Alert";

export default function CandidateProfilePage() {
  const { user } = useAuth();

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const quickLinks = [
    {
      title: "Saved Jobs",
      description:
        "Review your bookmarked opportunities",
      icon: Bookmark,
      to: "/saved-jobs",
    },

    {
      title: "My Applications",
      description:
        "Follow your application progress",
      icon: BriefcaseBusiness,
      to: "/applications",
    },

    {
      title: "AI Career Insights",
      description:
        "Explore personalized career intelligence",
      icon: Sparkles,
      to: "/ai-dashboard",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Candidate workspace"
        title="My Profile"
        description="Manage your professional identity and discover your next career opportunity."
      />

      <section className="section">
        <div className="container profile-preview-grid">
          <article className="preview-panel">
            <div className="preview-profile-heading">
              <span className="preview-avatar">
                {initials}
              </span>

              <div>
                <h2>{user.name}</h2>

                <p>
                  {user.headline ||
                    "CareerLens Candidate"}
                </p>

                <span className="candidate-label">
                  Candidate Account
                </span>
              </div>
            </div>

            <div className="preview-details">
              <div>
                <Mail size={18} />
                <span>{user.email}</span>
              </div>

              <div>
                <MapPin size={18} />
                <span>
                  {user.location ||
                    "Location not added"}
                </span>
              </div>

              <div>
                <Phone size={18} />
                <span>
                  {user.phone ||
                    "Phone not added"}
                </span>
              </div>
            </div>

            <div className="preview-section">
              <h3>
                <UserRound size={18} />
                About Me
              </h3>

              <p>
                {user.bio ||
                  "You have not added a professional summary yet."}
              </p>
            </div>

            <div className="preview-section">
              <h3>Professional Skills</h3>

              {user.skills?.length ? (
                <div className="skill-list">
                  {user.skills.map((skill) => (
                    <span key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No skills added yet.</p>
              )}
            </div>

            <div className="preview-section">
              <h3>
                <FileText size={18} />
                Resume
              </h3>

              <p>
                {user.resume?.filename
                  ? user.resume.originalName ||
                    "Resume uploaded"
                  : "No resume uploaded yet."}
              </p>
            </div>
          </article>

          <aside className="profile-preview-sidebar">
            <Alert type="info">
              Your account is connected to MongoDB.
              Full profile editing and resume
              management will be added in Phase 8.
            </Alert>

            <div className="preview-panel">
              <h3>Candidate Workspace</h3>

              <div className="profile-quick-links">
                {quickLinks.map(
                  ({
                    title,
                    description,
                    icon: Icon,
                    to,
                  }) => (
                    <Link key={to} to={to}>
                      <span className="quick-link-icon">
                        <Icon size={20} />
                      </span>

                      <div>
                        <strong>{title}</strong>
                        <p>{description}</p>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}