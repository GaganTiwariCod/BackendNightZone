const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'ShubhkaalNewsAggregator/1.0 (+https://shubhkaal.com/bot; news-indexer)',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*'
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator']
    ]
  }
});

/**
 * Strip HTML tags and normalize whitespace
 */
const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extract an image URL from RSS item metadata
 */
const extractImageUrl = (item) => {
  // 1. Enclosure
  if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
    return item.enclosure.url;
  }
  if (item.enclosure && item.enclosure.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }

  // 2. Media content
  if (item.mediaContent && Array.isArray(item.mediaContent)) {
    for (const m of item.mediaContent) {
      if (m.$ && m.$.url) return m.$.url;
      if (typeof m === 'string' && m.startsWith('http')) return m;
    }
  }

  // 3. Media thumbnail
  if (item.mediaThumbnail && Array.isArray(item.mediaThumbnail)) {
    for (const t of item.mediaThumbnail) {
      if (t.$ && t.$.url) return t.$.url;
      if (typeof t === 'string' && t.startsWith('http')) return t;
    }
  }

  // 4. Look inside content / description HTML
  const rawHtml = item.contentEncoded || item.content || item.summary || item.description || '';
  const imgMatch = rawHtml.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }

  return null;
};

/**
 * Parse an RSS / Atom feed URL
 * @param {string} feedUrl
 * @returns {Promise<Array<object>>} Normalized articles
 */
const parseRssFeed = async (feedUrl) => {
  if (!feedUrl) throw new Error('Feed URL is required');

  const feed = await parser.parseURL(feedUrl);
  const articles = [];

  if (!feed || !Array.isArray(feed.items)) {
    return articles;
  }

  for (const item of feed.items) {
    const title = (item.title || '').trim();
    const link = (item.link || item.guid || '').trim();

    if (!title || !link) continue;

    const rawSummary = item.contentSnippet || item.summary || item.description || '';
    const cleanSummary = stripHtml(rawSummary).slice(0, 300);

    const rawContent = item.contentEncoded || item.content || item.description || '';
    const cleanExcerpt = stripHtml(rawContent).slice(0, 800);

    const imageUrl = extractImageUrl(item);
    const author = (item.creator || item.author || feed.title || '').slice(0, 150);

    let publishedAt = new Date();
    if (item.isoDate) {
      publishedAt = new Date(item.isoDate);
    } else if (item.pubDate) {
      const parsed = new Date(item.pubDate);
      if (!isNaN(parsed.getTime())) publishedAt = parsed;
    }

    articles.push({
      title,
      link,
      summary: cleanSummary || cleanExcerpt.slice(0, 200),
      excerpt: cleanExcerpt,
      imageUrl,
      author: author || null,
      publishedAt,
      sourceName: feed.title || 'RSS Feed'
    });
  }

  return articles;
};

module.exports = {
  parseRssFeed,
  stripHtml,
  extractImageUrl
};
