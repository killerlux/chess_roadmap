import Fuse from "fuse.js";

export interface SearchableItem {
  id: string;
  title: string;
  summary: string;
  tags?: string[];
}

export class SearchIndex {
  private fuse: Fuse<SearchableItem>;

  constructor(items: SearchableItem[]) {
    this.fuse = new Fuse(items, {
      keys: ["title", "summary", "tags"],
      threshold: 0.35,
      includeScore: true,
    });
  }

  search(term: string, limit = 10): SearchableItem[] {
    if (!term.trim()) {
      return [];
    }

    return this.fuse.search(term, { limit }).map((result) => result.item);
  }
}
