import Link from "next/link";

import { NodeCard } from "@/components/NodeCard";
import { ResourceList } from "@/components/ResourceList";
import {
  getResourceCategories,
  getRoadmap,
  resolveResourcesById,
} from "@/lib/content";

const STAGE_LABELS: Record<string, string> = {
  beginner: "Beginner",
  improver: "Improver",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const STAGE_ORDER = ["beginner", "improver", "intermediate", "advanced"];

function formatTrackLabel(value: string) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default async function Home() {
  const [categories, roadmap] = await Promise.all([
    getResourceCategories(),
    getRoadmap(),
  ]);

  const featuredResources = categories
    .flatMap((category) =>
      category.resources.slice(0, 2).map((resource) => ({
        title: resource.title,
        url: resource.url,
        summary: resource.summary,
        category: category.name,
      })),
    )
    .slice(0, 6);

  const stageGroups = STAGE_ORDER.map((stage) => ({
    stage,
    nodes: (roadmap?.nodes ?? [])
      .filter((node) => node.stage === stage)
      .slice(0, 2),
  })).filter((group) => group.nodes.length > 0);

  const practiceGoals = roadmap?.practice_goals ?? [];

  return (
    <div className="container-grid">
      <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary/10 px-4 py-1 text-sm font-medium text-secondary-foreground">
          Welcome to Chess Roadmap
        </span>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Build chess mastery one deliberate step at a time.
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          We are curating an original, CC0-friendly learning path for players
          who want structure without losing creativity. Follow stage-based
          guides, explore curated practice goals, and track your personal
          progress as the roadmap evolves.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="#roadmap"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Preview roadmap outline
          </Link>
          <Link
            href="#resources"
            className="inline-flex items-center justify-center rounded-full border border-input px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Browse curated resources
          </Link>
        </div>
      </section>

      <section
        id="roadmap"
        className="space-y-6 rounded-xl border border-border bg-muted/30 p-8"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Roadmap snapshot
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Each stage highlights why the lessons matter, what outcomes to aim
            for, and which CC0 resources reinforce the ideas. Here is a quick
            preview of the upcoming content.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {stageGroups.map((group) => (
            <div key={group.stage} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {STAGE_LABELS[group.stage]}
                </h3>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {group.nodes.length} preview nodes
                </span>
              </div>
              <div className="grid gap-4">
                {group.nodes.map((node) => {
                  const relatedResources = resolveResourcesById(
                    categories,
                    node.resources,
                  ).slice(0, 2);
                  return (
                    <NodeCard
                      key={node.id}
                      title={node.title}
                      summary={node.why}
                      badges={[
                        {
                          label: STAGE_LABELS[node.stage] ?? node.stage,
                          variant: "outline",
                        },
                        {
                          label: formatTrackLabel(node.track),
                          variant: "secondary",
                        },
                      ]}
                      footer={
                        relatedResources.length > 0 ? (
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {relatedResources.map((resource) => (
                              <li key={resource.id}>
                                <a
                                  href={resource.url}
                                  className="underline-offset-2 hover:underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {resource.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : null
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {practiceGoals.length > 0 && (
        <section className="rounded-xl border border-dashed border-border bg-card p-8">
          <h2 className="text-xl font-semibold text-foreground">
            Practice benchmarks
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            These benchmarks anchor your weekly training. Check them off as you
            build momentum across tracks.
          </p>
          <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {practiceGoals.map((goal) => (
              <li key={goal} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 inline-block h-2 w-2 rounded-full bg-primary"
                />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        id="resources"
        className="space-y-4 rounded-xl border border-border bg-card/60 p-8"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            Featured CC0 resources
          </h2>
          <p className="text-sm text-muted-foreground">
            We hand-review every link from the Awesome Chess list and write
            fresh summaries so you know why each resource matters.
          </p>
        </div>
        <ResourceList resources={featuredResources} />
      </section>
    </div>
  );
}
