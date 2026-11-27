import { BriefcaseBusiness } from "lucide-react";

import PlaceholderPage from "./PlaceholderPage";

export default function JobDetailsPage() {
  return (
    <PlaceholderPage
      title="Job Details"
      description="Explore job responsibilities, skills, compensation and company information."
      phase="7"
      icon={BriefcaseBusiness}
      actionTo="/jobs"
      actionLabel="Browse Jobs"
    />
  );
}