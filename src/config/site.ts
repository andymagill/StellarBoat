/**
 * Site configuration entry point.
 *
 * All components import from this file — NEVER directly from site.example.ts.
 *
 * IMPORTANT: Do not delete site.example.ts! It is the source of truth for site configuration.
 *
 * To customize for your fork:
 * 1. Edit src/config/site.example.ts directly (recommended for simple forks)
 * 2. OR: Duplicate site.example.ts → site.local.ts, then import './site.local' below,
 *    and add site.local.ts to .gitignore for environment-specific config
 *
 * The current pattern (re-export from site.example.ts) is safe as long as
 * site.example.ts is never deleted. If using multiple deployment environments,
 * migrate to the site.local.ts pattern above.
 */
export { siteConfig } from './site.example';
