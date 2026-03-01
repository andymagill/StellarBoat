/**
 * RSS feed endpoint: /rss.xml
 * Returns RSS feed of published blog posts.
 * Returns 404 when features.rss is false.
 * Returns empty feed when features.blog is false.
 */

import rss from '@astrojs/rss';
import { siteConfig } from '../config/site';
import { getPublishedPosts } from '../utils/blog';

export async function GET(context) {
  // Return 404 if RSS feature is disabled
  if (!siteConfig.features.rss) {
    return new Response('Not Found', { status: 404 });
  }

  // Return empty feed if blog is disabled
  if (!siteConfig.features.blog) {
    return rss({
      title: siteConfig.name,
      description: siteConfig.tagline,
      site: context.site,
      items: [],
    });
  }

  const posts = await getPublishedPosts();

  return rss({
    title: `${siteConfig.name} - Blog`,
    description: siteConfig.tagline,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/blog/${post.id}`,
      author: post.data.author,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
