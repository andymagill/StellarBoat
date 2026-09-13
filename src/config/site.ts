/**
 * Site configuration entry point.
 *
 * ⚠️  FRAGILE PATTERN: This file re-exports from site.example.ts.
 * If site.example.ts is accidentally deleted or moved, the entire site build will fail.
 *
 * CRITICAL: All components import from this file — NEVER directly from site.example.ts.
 * NEVER delete site.example.ts! It is the source of truth for site configuration.
 *
 * To customize for your fork:
 * 1. (Simple) Edit src/config/site.example.ts directly
 * 2. (Recommended) Duplicate site.example.ts → site.local.ts, then:
 *    - Uncomment the import below
 *    - Edit site.local.ts
 *    - Add site.local.ts to .gitignore
 *
 * Multi-Environment Pattern (Commented Out):
 * If you need environment-specific configs, uncomment this and follow the setup above:
 * // import { siteConfig } from './site.local';
 * // export { siteConfig };
 */
export { siteConfig } from './site.example';
