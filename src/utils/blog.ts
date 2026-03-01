/**
 * Blog utility functions for querying and filtering posts.
 * Uses Astro 5 Content Layer API with getCollection().
 */

import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * Get all published blog posts.
 * Filters out draft posts in production; includes all posts in dev.
 * Returns posts sorted by publishedAt in descending order.
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const allPosts = await getCollection('blog');

  // Filter out drafts in production
  const published = import.meta.env.PROD
    ? allPosts.filter((post) => !post.data.draft)
    : allPosts;

  // Sort by published date, most recent first
  return published.sort(
    (a, b) =>
      new Date(b.data.publishedAt).getTime() -
      new Date(a.data.publishedAt).getTime()
  );
}

/**
 * Get featured blog posts (marked with featured: true).
 * Returns sorted by publishedAt descending.
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const published = await getPublishedPosts();
  return published.filter((post) => post.data.featured);
}

/**
 * Get all posts with a specific tag.
 * Case-insensitive tag matching.
 * Returns sorted by publishedAt descending.
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const published = await getPublishedPosts();
  const lowerTag = tag.toLowerCase();
  return published.filter((post) =>
    post.data.tags.map((t) => t.toLowerCase()).includes(lowerTag)
  );
}

/**
 * Get all unique tags across published blog posts.
 * Returns sorted alphabetically.
 */
export async function getAllTags(): Promise<string[]> {
  const published = await getPublishedPosts();
  const tags = new Set<string>();

  published.forEach((post) => {
    post.data.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * Calculate reading time estimate in minutes.
 * Uses average reading speed of 200 words per minute.
 */
export function getReadingTime(body: string): number {
  const wordsPerMinute = 200;
  const wordCount = body.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get the author data for a blog post.
 * Returns the author object or null if author not found.
 */
export async function getAuthor(authorSlug: string) {
  try {
    const author = await import(`../content/authors/${authorSlug}.json`);
    return author.default;
  } catch {
    return null;
  }
}

/**
 * Get previous and next posts for navigation.
 * Returns { prev, next } where each is the adjacent BlogPost or null.
 */
export async function getPrevNextPosts(
  currentId: string
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  const published = await getPublishedPosts();
  const currentIndex = published.findIndex((post) => post.id === currentId);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? published[currentIndex - 1] : null,
    next:
      currentIndex < published.length - 1 ? published[currentIndex + 1] : null,
  };
}
