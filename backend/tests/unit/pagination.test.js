import { describe, it, expect } from 'vitest';
import {
  parsePagination,
  buildMeta,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
} from '../../src/utils/pagination.js';

describe('pagination', () => {
  it('should default to page 1 and the default page size', () => {
    expect(parsePagination({})).toEqual({
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      limit: DEFAULT_PER_PAGE,
      offset: 0,
    });
  });

  it('should compute the offset from page and perPage', () => {
    expect(parsePagination({ page: '3', perPage: '10' })).toEqual({
      page: 3,
      perPage: 10,
      limit: 10,
      offset: 20,
    });
  });

  it('should clamp perPage to the maximum', () => {
    expect(parsePagination({ perPage: '1000' }).perPage).toBe(MAX_PER_PAGE);
  });

  it('should floor an invalid page to 1', () => {
    expect(parsePagination({ page: '0' }).page).toBe(1);
    expect(parsePagination({ page: '-5' }).page).toBe(1);
  });

  it('should build a meta object', () => {
    expect(buildMeta(2, 20, 45)).toEqual({ page: 2, perPage: 20, total: 45 });
  });
});
