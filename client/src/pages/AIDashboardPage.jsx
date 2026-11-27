import { BrainCircuit } from "lucide-react";

import PlaceholderPage from "./PlaceholderPage";

export default function AIDashboardPage() {
  return (
    <PlaceholderPage
      title="AI Career Intelligence"
      description="Discover personalized career recommendations and insights based on your interests."
      phase="10"
      icon={BrainCircuit}
      actionTo="/jobs"
      actionLabel="Explore Opportunities"
    />
  );
}