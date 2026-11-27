import { Building2 } from "lucide-react";

import PlaceholderPage from "./PlaceholderPage";

export default function CompanyProfilePage() {
  return (
    <PlaceholderPage
      title="Company Profile"
      description="Learn about the organization, employee benefits and available positions."
      phase="7"
      icon={Building2}
      actionTo="/companies"
      actionLabel="Browse Companies"
    />
  );
}