import type { AnalyticsConfig } from '../types/config';

/**
 * Global analytics configuration.
 * This config controls GTM integration, consent mode, and custom attributes.
 *
 * To use:
 * - Set `gtmId` to your Google Tag Manager container ID (e.g., 'GTM-XXXXXXX')
 * - Set `gtmId: null` to disable GTM entirely
 * - When `consentMode: true`, a consent banner and consent defaults block are injected
 * - `customAttributes` are passed to the GTM script for custom tracking
 */
export const analytics: AnalyticsConfig = {
  gtmId: null,
  consentMode: false,
  customAttributes: {},
};
