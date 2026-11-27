import { BookOpen } from "lucide-react";

import PlaceholderPage from "./PlaceholderPage";

export default function BlogDetailsPage() {
  return (
    <PlaceholderPage
      title="Career Article"
      description="Read practical advice to support your professional journey."
      phase="11"
      icon={BookOpen}
      actionTo="/blog"
      actionLabel="Back to Career Advice"
    />
  );
}