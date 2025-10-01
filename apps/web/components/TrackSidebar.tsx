import Link from "next/link";
import * as ProgressPrimitive from "@radix-ui/react-progress";

export interface TrackProgress {
  slug: string;
  name: string;
  completed: number;
  total: number;
}

export interface TrackSidebarProps {
  tracks: TrackProgress[];
}

export function TrackSidebar({ tracks }: TrackSidebarProps) {
  return (
    <aside className="space-y-6 rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground">Tracks</h2>
      <div className="space-y-5">
        {tracks.map((track) => {
          const value =
            track.total === 0
              ? 0
              : Math.round((track.completed / track.total) * 100);
          const offset = Math.min(100, Math.max(0, 100 - value));
          return (
            <div key={track.slug} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Link
                  href={`/tracks/${track.slug}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {track.name}
                </Link>
                <span className="text-muted-foreground">{value}%</span>
              </div>
              <ProgressPrimitive.Root className="relative h-2 overflow-hidden rounded-full bg-muted">
                <ProgressPrimitive.Indicator
                  className="h-full w-full flex-1 bg-primary transition-transform"
                  style={{ transform: `translateX(-${offset}%)` }}
                />
              </ProgressPrimitive.Root>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
