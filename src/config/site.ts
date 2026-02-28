/**
 * Site configuration entry point.
 *
 * All components import from this file — never directly from site.example.ts.
 *
 * To configure your fork:
 * 1. Copy src/config/site.example.ts to src/config/site.ts
 * 2. Replace the re-export below with your own `siteConfig` export
 * 3. Fill in your project values and delete site.example.ts
 *
 * Example fork site.ts:
 *
 *   import type { SiteConfig } from '../types/config.ts';
 *   export const siteConfig: SiteConfig = {
 *     name: 'My Awesome Site',
 *     brandName: 'My Site',
 *     ...
 *   };
 */
export { siteConfig } from './site.example';
