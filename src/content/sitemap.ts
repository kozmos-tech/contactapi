// XML sitemap for SEO. Lists the public, indexable pages so crawlers can find
// them. Auth-gated pages (/dashboard) and API/MCP endpoints are intentionally
// omitted — they have nothing to index.

import { posts } from './blog.js'

const BASE_URL = 'https://contactapi.dev'

type Entry = {
  path: string
  /** ISO date, YYYY-MM-DD. */
  lastmod: string
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: string
}

// Newest post date, used as lastmod for the pages that list all posts.
const latestPostDate = posts.reduce((max, p) => (p.date > max ? p.date : max), '1970-01-01')

const staticEntries: Entry[] = [
  { path: '/', lastmod: latestPostDate, changefreq: 'weekly', priority: '1.0' },
  { path: '/blog', lastmod: latestPostDate, changefreq: 'weekly', priority: '0.8' },
  { path: '/login', lastmod: latestPostDate, changefreq: 'monthly', priority: '0.3' },
  { path: '/signup', lastmod: latestPostDate, changefreq: 'monthly', priority: '0.3' },
]

const postEntries: Entry[] = posts.map((p) => ({
  path: `/blog/${p.slug}`,
  lastmod: p.date,
  changefreq: 'monthly',
  priority: '0.6',
}))

function urlTag({ path, lastmod, changefreq, priority }: Entry): string {
  return `  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...postEntries].map(urlTag).join('\n')}
</urlset>
`

// robots.txt points crawlers at the sitemap and keeps them out of the app/API.
export const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /v1/
Disallow: /mcp
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`
