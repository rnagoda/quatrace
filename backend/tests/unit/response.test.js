import { describe, it, expect } from 'vitest';
import { ok, fail } from '../../src/utils/response.js';

describe('response envelope', () => {
  it('should wrap a payload in the success envelope when given data', () => {
    const result = ok({ id: 1 });
    expect(result).toEqual({ data: { id: 1 }, meta: null, error: null });
  });

  it('should attach meta when pagination is provided', () => {
    const meta = { page: 1, perPage: 20, total: 143 };
    const result = ok([{ id: 1 }], meta);
    expect(result.meta).toEqual(meta);
    expect(result.error).toBeNull();
  });

  it('should build the error envelope when given a code and message', () => {
    const result = fail('VALIDATION_ERROR', 'Title is required');
    expect(result).toEqual({
      data: null,
      meta: null,
      error: { code: 'VALIDATION_ERROR', message: 'Title is required', details: [] },
    });
  });

  it('should include field details when provided', () => {
    const details = [{ field: 'title', message: 'required' }];
    const result = fail('VALIDATION_ERROR', 'Invalid input', details);
    expect(result.error.details).toEqual(details);
  });
});
