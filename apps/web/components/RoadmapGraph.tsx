import type { ReactNode } from "react";

export interface RoadmapNode {
  id: string;
  title: string;
  stage: string;
  track: string;
  status?: "locked" | "available" | "complete";
  children?: RoadmapNode[];
}

export interface RoadmapGraphProps {
  nodes: RoadmapNode[];
  renderNode?: (node: RoadmapNode) => ReactNode;
}

export function RoadmapGraph({ nodes, renderNode }: RoadmapGraphProps) {
  return (
    <div className="grid gap-6">
      {nodes.map((node) => (
        <div key={node.id} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {node.stage}
              </p>
              <h3 className="text-lg font-semibold">{node.title}</h3>
              <p className="text-xs text-muted-foreground">
                Track: {node.track}
              </p>
            </div>
            <span className="text-xs font-medium uppercase text-primary">
              {node.status ?? "available"}
            </span>
          </div>
          {node.children && node.children.length > 0 ? (
            <div className="mt-3 grid gap-3 border-t border-dashed border-border pt-3 text-sm text-muted-foreground">
              {node.children.map((child) => (
                <div key={child.id}>
                  {renderNode ? renderNode(child) : child.title}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
