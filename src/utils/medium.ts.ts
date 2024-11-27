import Parser from 'rss-parser';
import fetch from 'node-fetch';

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export async function getMediumPosts(username: string): Promise<MediumPost[]> {
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
  const MEDIUM_FEED_URL = `${CORS_PROXY}${encodeURIComponent(`https://medium.com/feed/@${username}`)}`;

  try {
    const response = await fetch(MEDIUM_FEED_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new Parser();
    const feed = await parser.parseString(xmlText);

    return feed.items.map(item => ({
      title: item.title || 'Untitled Post',
      link: item.link || '#',
      pubDate: new Date(item.pubDate || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      description: item.contentSnippet?.slice(0, 150) + '...' || 'No description available'
    }));
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
}