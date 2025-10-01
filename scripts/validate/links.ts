#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import YAML from "yaml";

interface Resource {
  id: string;
  title: string;
  url: string;
  summary: string;
}

interface Category {
  name: string;
  slug: string;
  resources: Resource[];
}

interface DocumentShape {
  categories: Category[];
}

const SKIP_STATUS = process.env.SKIP_LINK_STATUS === "1";

function toKey(url: string) {
  return url.trim().toLowerCase();
}

async function loadResources(filePath: string): Promise<Resource[]> {
  const contents = await fs.readFile(filePath, "utf8");
  const parsed = YAML.parse(contents) as DocumentShape | null;

  if (!parsed || !Array.isArray(parsed.categories)) {
    throw new Error("resources.yaml is missing categories");
  }

  return parsed.categories.flatMap((category) => {
    if (!Array.isArray(category.resources)) {
      return [];
    }
    return category.resources.map((resource) => ({ ...resource }));
  });
}

async function probe(url: string) {
  const controller = AbortSignal.timeout(10000);
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller });
    if (head.ok || (head.status >= 200 && head.status < 400)) {
      return head.status;
    }
  } catch (error) {
    if (!(error instanceof Error) || error.name !== "TimeoutError") {
      // fall through to GET below
    }
  }

  await delay(250);
  const controllerGet = AbortSignal.timeout(10000);
  const response = await fetch(url, { method: "GET", redirect: "follow", signal: controllerGet });
  return response.status;
}

async function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, "..", "..");
  const resourcesPath = path.join(repoRoot, "content", "resources.yaml");

  const resources = await loadResources(resourcesPath);
  if (resources.length === 0) {
    console.log("No resources to validate.");
    return;
  }

  const seen = new Map<string, Resource>();
  const duplicateErrors: string[] = [];

  for (const resource of resources) {
    const key = toKey(resource.url);
    if (seen.has(key)) {
      duplicateErrors.push(`Duplicate URL detected: ${resource.url}`);
    } else {
      seen.set(key, resource);
    }
    if (!resource.summary || !resource.summary.trim()) {
      duplicateErrors.push(`Missing summary for: ${resource.title} (${resource.url})`);
    }
  }

  if (duplicateErrors.length > 0) {
    console.error(duplicateErrors.join("\n"));
    process.exit(1);
  }

  if (SKIP_STATUS) {
    console.warn(
      "SKIP_LINK_STATUS=1 detected. Skipping outbound HTTP checks and validating metadata only.",
    );
    console.log(`Validated ${resources.length} resource entries (structure only).`);
    return;
  }

  const concurrency = 5;
  const queue = [...resources];
  const failures: Array<{ url: string; status: number | string }> = [];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) {
        break;
      }
      try {
        const status = await probe(item.url);
        if (status < 200 || status >= 400) {
          failures.push({ url: item.url, status });
        }
      } catch (error) {
        failures.push({ url: item.url, status: error instanceof Error ? error.message : "unknown" });
      }
      await delay(50);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (failures.length > 0) {
    console.error("Link validation failed:\n" + failures.map((failure) => `${failure.url} -> ${failure.status}`).join("\n"));
    process.exit(1);
  }

  console.log(`Validated ${resources.length} resource links.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
