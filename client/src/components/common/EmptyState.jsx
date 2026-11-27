import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing to display yet",
  description,
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon
          size={32}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </div>

      <h2>{title}</h2>

      {description && (
        <p>{description}</p>
      )}

      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
}