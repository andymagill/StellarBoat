import { describe, it, expect, vi } from 'vitest';

// Mock astro:content before importing blog utilities
vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

import { getReadingTime } from '../../src/utils/blog';

describe('blog.ts', () => {
  describe('getReadingTime()', () => {
    it('returns 1 for empty string', () => {
      // Empty string.split(/\s+/) returns [''], which has length 1
      expect(getReadingTime('')).toBe(1);
    });

    it('returns 1 for very short text (1-200 words)', () => {
      const shortText = Array(100).fill('word').join(' ');
      expect(getReadingTime(shortText)).toBe(1);
    });

    it('returns 1 for exactly 200 words', () => {
      const text = Array(200).fill('word').join(' ');
      expect(getReadingTime(text)).toBe(1);
    });

    it('returns 2 minutes for ~400 words', () => {
      const text = Array(400).fill('word').join(' ');
      expect(getReadingTime(text)).toBe(2);
    });

    it('returns 5 minutes for 1000 words', () => {
      const text = Array(1000).fill('word').join(' ');
      expect(getReadingTime(text)).toBe(5);
    });

    it('rounds up fractional minutes', () => {
      // 210 words = 1.05 minutes, should round up to 2
      const text = Array(210).fill('word').join(' ');
      expect(getReadingTime(text)).toBe(2);
    });

    it('handles single word', () => {
      expect(getReadingTime('hello')).toBe(1);
    });

    it('handles text with multiple spaces, tabs, and newlines', () => {
      const text = 'word\n  word  word\tword'.repeat(50);
      const result = getReadingTime(text);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('uses 200 WPM as the reading speed', () => {
      // 600 words = 3 minutes at 200 WPM
      const text = Array(600).fill('word').join(' ');
      expect(getReadingTime(text)).toBe(3);
    });
  });
});
