#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const RAW_SOURCE = "https://raw.githubusercontent.com/hkirat/awesome-chess/master/README.md";

const CATEGORY_ORDER = [
  { heading: "Books", name: "Books", slug: "books" },
  { heading: "Move Validators", name: "Engines/Dev", slug: "engines-dev" },
  { heading: "Bots", name: "Engines/Dev", slug: "engines-dev" },
  { heading: "FEN Parsers", name: "Notation / PGN / FEN", slug: "notation" },
  { heading: "Board Notations", name: "Notation / PGN / FEN", slug: "notation" },
  { heading: "Boards", name: "Tools", slug: "tools" },
  { heading: "Pieces", name: "Tools", slug: "tools" },
  { heading: "Websites", name: "Communities", slug: "communities" },
  { heading: "Talks", name: "Strategy", slug: "strategy" },
];

const CATEGORY_LOOKUP = new Map<string, { name: string; slug: string }>();
for (const entry of CATEGORY_ORDER) {
  CATEGORY_LOOKUP.set(entry.heading, { name: entry.name, slug: entry.slug });
}

const SKIP_DOWNLOAD = process.env.SKIP_INGEST_DOWNLOAD === "1";

interface ResourceRecord {
  id: string;
  title: string;
  url: string;
  summary: string;
}

interface CategoryRecord {
  name: string;
  slug: string;
  resources: ResourceRecord[];
}

interface ResourcesDocument {
  categories: CategoryRecord[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function fetchReadme(): Promise<string> {
  const response = await fetch(RAW_SOURCE, {
    headers: { "User-Agent": "chess-roadmap-ingest" },
  });

  if (!response.ok) {
    throw new Error(`Failed to download awesome-chess README (${response.status})`);
  }

  return response.text();
}

function parseLinks(readme: string) {
  const lines = readme.split(/\r?\n/);
  const parsed: Array<{ heading: string; title: string; url: string }> = [];
  let currentHeading: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const nextLine = lines[index + 1]?.trim();

    const looksLikeHeading =
      !line.startsWith(" ") &&
      !line.startsWith("-") &&
      !line.startsWith("*") &&
      trimmed !== "---" &&
      nextLine === "---";

    if (looksLikeHeading) {
      currentHeading = trimmed;
      index += 1; // Skip the dashed underline
      continue;
    }

    if (!trimmed.startsWith("- [")) {
      continue;
    }

    if (!currentHeading) {
      continue;
    }

    const match = trimmed.match(/^- \[([^\]]+)\]\(([^)]+)\)/);
    if (!match) {
      continue;
    }

    const [, title, url] = match;
    parsed.push({ heading: currentHeading, title: title.trim(), url: url.trim() });
  }

  return parsed;
}

async function readExistingDocument(filePath: string): Promise<ResourcesDocument> {
  try {
    const current = await fs.readFile(filePath, "utf8");
    const parsed = YAML.parse(current) as ResourcesDocument | null;
    if (parsed && Array.isArray(parsed.categories)) {
      return parsed;
    }
    return { categories: [] };
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { categories: [] };
    }
    throw error;
  }
}

async function writeDocument(filePath: string, document: ResourcesDocument) {
  const output = YAML.stringify(document, {
    indent: 2,
    sortMapEntries: true,
  });
  await fs.writeFile(filePath, output, "utf8");
}

function mergeResources(
  fetched: Array<{ heading: string; title: string; url: string }>,
  existing: ResourcesDocument,
): ResourcesDocument {
  const result = new Map<string, CategoryRecord>();
  const summaryByUrl = new Map<string, string>();
  const idByUrl = new Map<string, string>();
  const categorySlugByUrl = new Map<string, string>();
  const categoryNameBySlug = new Map<string, string>();

  for (const category of existing.categories) {
    categoryNameBySlug.set(category.slug, category.name);
    for (const resource of category.resources) {
      summaryByUrl.set(resource.url.toLowerCase(), resource.summary ?? "");
      idByUrl.set(resource.url.toLowerCase(), resource.id ?? slugify(resource.title));
      categorySlugByUrl.set(resource.url.toLowerCase(), category.slug);
    }
  }

  const slugCounter = new Map<string, number>();

  for (const record of fetched) {
    const categoryMeta = CATEGORY_LOOKUP.get(record.heading);
    const normalizedUrl = record.url.toLowerCase();
    const preservedSlug = categorySlugByUrl.get(normalizedUrl);

    if (!categoryMeta && !preservedSlug) {
      continue;
    }

    const targetSlug = preservedSlug ?? categoryMeta?.slug ?? "uncategorized";
    const targetName =
      (preservedSlug && categoryNameBySlug.get(preservedSlug)) ??
      categoryMeta?.name ??
      preservedSlug ??
      "Uncategorized";

    if (!result.has(targetSlug)) {
      result.set(targetSlug, { name: targetName, slug: targetSlug, resources: [] });
    }

    const categoryEntry = result.get(targetSlug)!;
    const preservedId = idByUrl.get(normalizedUrl);
    const preservedSummary = summaryByUrl.get(normalizedUrl) ?? "";

    let id = preservedId ?? slugify(record.title);
    if (slugCounter.has(id)) {
      const next = (slugCounter.get(id) ?? 1) + 1;
      slugCounter.set(id, next);
      id = `${id}-${next}`;
    } else {
      slugCounter.set(id, 1);
    }

    categoryEntry.resources.push({
      id,
      title: record.title,
      url: record.url,
      summary: preservedSummary,
    });
  }

  const orderedCategories: CategoryRecord[] = [];
  const seen = new Set<string>();

  for (const order of CATEGORY_ORDER) {
    if (seen.has(order.slug)) {
      continue;
    }
    const category = result.get(order.slug);
    if (category) {
      orderedCategories.push({
        ...category,
        resources: category.resources.sort((a, b) => a.title.localeCompare(b.title)),
      });
      seen.add(order.slug);
    }
  }

  for (const [slug, category] of result.entries()) {
    if (seen.has(slug)) {
      continue;
    }
    orderedCategories.push({
      ...category,
      resources: category.resources.sort((a, b) => a.title.localeCompare(b.title)),
    });
    seen.add(slug);
  }

  return { categories: orderedCategories };
}

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, "..", "..");
  const resourcesPath = path.join(repoRoot, "content", "resources.yaml");

  const existingDocument = await readExistingDocument(resourcesPath);

  if (SKIP_DOWNLOAD) {
    console.warn(
      "SKIP_INGEST_DOWNLOAD=1 detected. Using existing resources.yaml without attempting to fetch awesome-chess.",
    );
    return;
  }

  let readme: string;
  try {
    readme = await fetchReadme();
  } catch (error) {
    console.error("Failed to download awesome-chess README.");
    console.error("Set SKIP_INGEST_DOWNLOAD=1 to skip remote fetching in offline environments.");
    throw error;
  }

  const links = parseLinks(readme);
  const merged = mergeResources(links, existingDocument);
  await writeDocument(resourcesPath, merged);

  const total = merged.categories.reduce((sum, category) => sum + category.resources.length, 0);
  console.log(`Updated resources.yaml with ${total} curated links.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
