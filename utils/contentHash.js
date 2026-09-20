const crypto = require('crypto');
const { normalizeText } = require('./textNormalizer');

/**
 * Generate a deterministic SHA-256 content hash
 * @param {string} title
 * @param {string} sourceUrl
 * @param {string} excerpt
 * @returns {string} 64-char hex hash
 */
const generateContentHash = (title, sourceUrl, excerpt = '') => {
  const normTitle = normalizeText(title);
  const cleanUrl = (sourceUrl || '').trim().toLowerCase().split('?')[0]; // strip query params
  const normExcerpt = normalizeText(excerpt).slice(0, 150); // first 150 chars
  
  const rawString = `${cleanUrl}|${normTitle}|${normExcerpt}`;
  return crypto.createHash('sha256').update(rawString, 'utf8').digest('hex');
};

/**
 * Generate canonical URL
 */
const sanitizeCanonicalUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url.trim());
    // Strip common tracking params like utm_*
    parsed.searchParams.forEach((val, key) => {
      if (key.startsWith('utm_') || key === 'ref' || key === 'source' || key === 'fbclid') {
        parsed.searchParams.delete(key);
      }
    });
    return parsed.toString();
  } catch {
    return url.trim().split('?')[0];
  }
};

module.exports = {
  generateContentHash,
  sanitizeCanonicalUrl
};
