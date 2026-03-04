import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { trackEvent } from '../../src/utils/analytics';

describe('analytics.ts', () => {
  describe('trackEvent()', () => {
    let dataLayer: unknown[];

    beforeEach(() => {
      // Setup a mock dataLayer and window object
      dataLayer = [];
      vi.stubGlobal('window', {
        dataLayer,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('pushes event with name to dataLayer', () => {
      trackEvent('page_view');
      expect(dataLayer).toHaveLength(1);
      expect(dataLayer[0]).toEqual({ event: 'page_view' });
    });

    it('includes params in dataLayer push', () => {
      trackEvent('form_submit', {
        form_name: 'contact',
        form_id: 'contact-form',
      });
      expect(dataLayer).toHaveLength(1);
      expect(dataLayer[0]).toEqual({
        event: 'form_submit',
        form_name: 'contact',
        form_id: 'contact-form',
      });
    });

    it('handles multiple events', () => {
      trackEvent('event1');
      trackEvent('event2', { key: 'value' });
      expect(dataLayer).toHaveLength(2);
      expect(dataLayer[0]).toEqual({ event: 'event1' });
      expect(dataLayer[1]).toEqual({ event: 'event2', key: 'value' });
    });

    it('no-ops when window is undefined', () => {
      vi.unstubAllGlobals();
      // Simulate SSR context where window is undefined
      expect(() => {
        trackEvent('test_event');
      }).not.toThrow();
    });

    it('no-ops when dataLayer is not an array', () => {
      vi.stubGlobal('window', {
        dataLayer: null,
      });
      expect(() => {
        trackEvent('test_event');
      }).not.toThrow();
    });

    it('no-ops when dataLayer is not initialized', () => {
      vi.stubGlobal('window', {});
      expect(() => {
        trackEvent('test_event');
      }).not.toThrow();
    });
  });
});
