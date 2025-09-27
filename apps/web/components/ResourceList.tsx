export interface ResourceItem {
  title: string;
  url: string;
  summary: string;
  category: string;
}

export interface ResourceListProps {
  resources: ResourceItem[];
}

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No resources available yet. Check back soon.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {resources.map((resource) => (
        <li
          key={resource.url}
          className="rounded-lg border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-primary hover:underline"
            >
              {resource.title}
            </a>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {resource.category}
            </p>
            <p className="text-sm text-muted-foreground">{resource.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
