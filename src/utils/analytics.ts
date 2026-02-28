/**
 * Analytics utility for tracking events with Google Tag Manager.
 */

/**
 * Track a custom event in the dataLayer.
 * No-ops if the dataLayer is not initialized or window is not available.
 *
 * @param name - The event name (e.g., 'form_submit', 'video_play')
 * @param params - Optional event parameters to send with the event
 *
 * @example
 * trackEvent('form_submit', { form_name: 'contact', form_id: 'contact-form' });
 */
export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!Array.isArray(window.dataLayer)) {
    return;
  }

  window.dataLayer.push({
    event: name,
    ...params,
  });
}
