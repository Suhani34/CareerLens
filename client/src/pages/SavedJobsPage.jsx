import { Bookmark } from "lucide-react";

import PlaceholderPage from "./PlaceholderPage";

export default function SavedJobsPage() {
  return (
    <PlaceholderPage
      title="Saved Jobs"
      description="Keep track of opportunities you are interested in."
      phase="9"
      icon={Bookmark}
      actionTo="/jobs"
      actionLabel="Explore Jobs"
    />
  );
}