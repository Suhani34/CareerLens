import { Link } from "react-router-dom";
import { ArrowLeft, Layers3 } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";

export default function PlaceholderPage({
  title,
  description,
  phase,
  icon: Icon = Layers3,
  actionTo = "/",
  actionLabel = "Back to Homepage",
}) {
  return (
    <>
      <PageHeader
        eyebrow="CareerLens"
        title={title}
        description={description}
      />

      <section className="section">
        <div className="container">
          <EmptyState
            icon={Icon}
            title={`${title} is being developed`}
            description={
              `This page is connected to the navigation system. ` +
              `Its complete functionality will be implemented in Phase ${phase}.`
            }
            action={
              <Link
                to={actionTo}
                className="btn btn-primary btn-md"
              >
                <ArrowLeft size={17} />
                {actionLabel}
              </Link>
            }
          />
        </div>
      </section>
    </>
  );
}