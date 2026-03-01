/**
 * Astro 5 Content Layer API configuration.
 *
 * Defines three collections: blog posts, authors, and static pages.
 * Run `astro sync` after editing to regenerate `.astro/types.d.ts`.
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts collection.
 * MDX files in src/content/blog/ with frontmatter schema.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    /** Post title */
    title: z.string(),

    /** Short description for meta description tag (max 160 characters) */
    description: z.string().max(160),

    /** Publication date */
    publishedAt: z.coerce.date(),

    /** Optional: date of last update */
    updatedAt: z.coerce.date().optional(),

    /** Author slug; references authors collection */
    author: z.string(),

    /** Optional: array of tag strings */
    tags: z.array(z.string()).default([]),

    /** Optional: cover image with alt text */
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),

    /** Optional: mark as draft (excluded from production builds) */
    draft: z.boolean().default(false),

    /** Optional: mark as featured (surfaces on blog index) */
    featured: z.boolean().default(false),

    /** Optional: canonical URL for cross-posts */
    canonicalUrl: z.string().url().optional(),
  }),
});

/**
 * Authors collection.
 * JSON files in src/content/authors/ — one author per file.
 */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: z.object({
    /** Author full name */
    name: z.string(),

    /** Short bio (under 200 characters) */
    bio: z.string().max(200),

    /** Path to author avatar image */
    avatar: z.string().optional(),

    /** Optional: Twitter handle (without @) */
    twitter: z.string().optional(),

    /** Optional: personal website URL */
    website: z.string().url().optional(),
  }),
});

/**
 * Static pages collection.
 * MDX files in src/content/pages/ for content-heavy pages (About, Privacy, Terms, etc.).
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: z.object({
    /** Page title */
    title: z.string(),

    /** Meta description (max 160 characters) */
    description: z.string().max(160),

    /** Optional: exclude from search engines (for legal/internal pages) */
    noIndex: z.boolean().default(false),

    /** Optional: date of last update */
    updatedAt: z.coerce.date().optional(),
  }),
});

// Export collections as required by Content Layer API
export const collections = { blog, authors, pages };
