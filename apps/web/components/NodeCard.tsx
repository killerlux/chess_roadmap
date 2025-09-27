import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface NodeCardProps {
  title: string;
  summary: string;
  badges?: Array<{
    label: string;
    variant?: ComponentProps<typeof Badge>["variant"];
  }>;
  footer?: ReactNode;
}

export function NodeCard({
  title,
  summary,
  badges = [],
  footer,
}: NodeCardProps) {
  const titleId = useId();

  return (
    <Card role="article" aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle
          id={titleId}
          className="flex flex-wrap items-center gap-2 text-xl"
        >
          {title}
          {badges.map((badge) => (
            <Badge key={badge.label} variant={badge.variant ?? "secondary"}>
              {badge.label}
            </Badge>
          ))}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{summary}</p>
        {footer}
      </CardContent>
    </Card>
  );
}
