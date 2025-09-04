import { generateRssFeed } from '@/lib/rss';
import { siteConfig } from '@/config/site';

export async function GET() {
  const rssItems = await generateRssFeed();
  
  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    ${rssItems.map(item => `
    <item>
      <title>${item.title}</title>
      <link>${item.url}</link>
      <description>${item.description}</description>
      <pubDate>${item.date}</pubDate>
    </item>
    `).join('')}
  </channel>
</rss>`;
  
  return new Response(rssContent, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
