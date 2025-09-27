import { describe, expect, it } from "vitest";
import { SearchIndex } from "@/lib/search";

describe("SearchIndex", () => {
  it("returns matched items", () => {
    const items = [
      { id: "1", title: "King safety", summary: "Learn basic mating nets" },
      {
        id: "2",
        title: "Endgame fundamentals",
        summary: "Opposition and promotion",
      },
    ];
    const index = new SearchIndex(items);

    expect(index.search("king")).toHaveLength(1);
    expect(index.search("king")[0]).toMatchObject({ id: "1" });
  });

  it("returns empty array when query blank", () => {
    const index = new SearchIndex([]);
    expect(index.search("   ")).toEqual([]);
  });
});
