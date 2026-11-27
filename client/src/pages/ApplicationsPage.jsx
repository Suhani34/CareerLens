import { ClipboardList } from "lucide-react";

import PlaceholderPage from "./PlaceholderPage";

export default function ApplicationsPage() {
  return (
    <PlaceholderPage
      title="My Applications"
      description="Manage your job applications and follow your recruitment progress."
      phase="9"
      icon={ClipboardList}
      actionTo="/jobs"
      actionLabel="Find Opportunities"
    />
  );
}