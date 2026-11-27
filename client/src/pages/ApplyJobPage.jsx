import { FileText } from "lucide-react";

import PlaceholderPage from "./PlaceholderPage";

export default function ApplyJobPage() {
  return (
    <PlaceholderPage
      title="Apply for a Job"
      description="Prepare your application, attach documents and submit your information."
      phase="9"
      icon={FileText}
      actionTo="/jobs"
      actionLabel="Browse Jobs"
    />
  );
}