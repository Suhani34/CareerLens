export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <header className="page-header">
      <div className="container page-header-inner">
        <div>
          {eyebrow && (
            <span className="eyebrow">
              {eyebrow}
            </span>
          )}

          <h1>{title}</h1>

          {description && (
            <p>{description}</p>
          )}
        </div>

        {action && (
          <div className="page-header-action">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}