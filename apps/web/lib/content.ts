import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import YAML from "yaml";

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  summary: string;
}

export interface ResourceCategory {
  name: string;
  slug: string;
  resources: ResourceItem[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  track: string;
  stage: string;
  why: string;
  outcomes: string[];
  time_estimate: string;
  prerequisites: string[];
  resources: string[];
}

export interface TrackSummary {
  id: string;
  title: string;
  summary: string;
  stages: string[];
}

export interface RoadmapDocument {
  tracks: TrackSummary[];
  practice_goals: string[];
  nodes: RoadmapNode[];
}

const repoRoot = path.resolve(process.cwd(), "..", "..");
const contentDir = path.join(repoRoot, "content");

async function readFile(relativePath: string) {
  const filePath = path.join(contentDir, relativePath);
  return fs.readFile(filePath, "utf8");
}

type RawResourceCategory = {
  name: string;
  slug: string;
  resources?: Array<Partial<ResourceItem>>;
};

export const getResourceCategories = cache(
  async (): Promise<ResourceCategory[]> => {
    const file = await readFile("resources.yaml");
    const parsed = YAML.parse(file) as {
      categories?: RawResourceCategory[];
    } | null;
    if (!parsed || !Array.isArray(parsed.categories)) {
      return [];
    }

    return parsed.categories
      .map((category) => ({
        ...category,
        resources: (category.resources ?? [])
          .map((resource) => ({
            id: resource.id ?? "",
            title: resource.title ?? "",
            url: resource.url ?? "",
            summary: resource.summary ?? "",
          }))
          .filter((resource) => resource.id && resource.title && resource.url),
      }))
      .filter((category) => category.resources.length > 0);
  },
);

export const getRoadmap = cache(async (): Promise<RoadmapDocument | null> => {
  try {
    const file = await readFile("roadmap.json");
    const parsed = JSON.parse(file) as RoadmapDocument;
    return parsed;
  } catch (error) {
    console.error("Failed to load roadmap.json", error);
    return null;
  }
});

export function resolveResourcesById(
  categories: ResourceCategory[],
  ids: string[],
): ResourceItem[] {
  if (ids.length === 0) {
    return [];
  }
  const index = new Map<string, ResourceItem>();
  for (const category of categories) {
    for (const resource of category.resources) {
      index.set(resource.id, { ...resource });
    }
  }
  return ids
    .map((id) => index.get(id))
    .filter((resource): resource is ResourceItem => Boolean(resource));
}
