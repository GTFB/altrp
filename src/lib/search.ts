import Fuse from 'fuse.js';

export type SearchRecord = Record<string, unknown> & {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
};

export function createSearchIndex(items: SearchRecord[]) {
  return new Fuse(items, {
    includeScore: true,
    keys: ['title', 'content', 'tags'] as Array<keyof SearchRecord>,
    threshold: 0.35,
  });
}
