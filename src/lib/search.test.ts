import { describe, it, expect } from 'bun:test';
import { createSearchIndex } from '@/lib/search';

describe('Search Utils', () => {
  it('should create search index', () => {
    const items = [
      { id: '1', title: 'Test Post', content: 'Test content', tags: ['test'] },
    ];
    
    const index = createSearchIndex(items);
    expect(index).toBeDefined();
  });

  it('should search items', () => {
    const items = [
      { id: '1', title: 'Test Post', content: 'Test content', tags: ['test'] },
    ];
    
    const index = createSearchIndex(items);
    const results = index.search('Test');
    expect(results.length).toBeGreaterThan(0);
  });
});
