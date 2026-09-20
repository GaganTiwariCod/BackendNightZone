const { News } = require('../models');
const { normalizeText, tokenize } = require('../utils/textNormalizer');
const { generateContentHash, sanitizeCanonicalUrl } = require('../utils/contentHash');

/**
 * Calculate Jaccard similarity between two token sets
 */
const jaccardSimilarity = (tokensA, tokensB) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Multi-Tier Duplicate Check
 * @param {object} articleData { title, link, excerpt }
 * @returns {Promise<{ isDuplicate: boolean, reason?: string, existingId?: string }>}
 */
const checkDuplicate = async (articleData) => {
  const canonicalUrl = sanitizeCanonicalUrl(articleData.link || articleData.source_url);
  const contentHash = generateContentHash(
    articleData.title,
    canonicalUrl,
    articleData.excerpt || articleData.summary || ''
  );

  // 1. Check Exact Canonical URL
  const byUrl = await News.findOne({
    where: { source_url: canonicalUrl },
    attributes: ['id', 'title', 'status']
  });
  if (byUrl) {
    return { isDuplicate: true, reason: 'exact_url', existingId: byUrl.id };
  }

  // 2. Check Content Hash
  const byHash = await News.findOne({
    where: { content_hash: contentHash },
    attributes: ['id', 'title', 'status']
  });
  if (byHash) {
    return { isDuplicate: true, reason: 'exact_content_hash', existingId: byHash.id };
  }

  // 3. Similar Title Check within recent articles (last 7 days)
  const normTitle = normalizeText(articleData.title);
  const newTokens = tokenize(normTitle);

  if (newTokens.length >= 3) {
    const recentNews = await News.findAll({
      limit: 100,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'title']
    });

    for (const item of recentNews) {
      const itemTokens = tokenize(item.title);
      const similarity = jaccardSimilarity(newTokens, itemTokens);

      if (similarity >= 0.85) {
        return { isDuplicate: true, reason: 'similar_title', existingId: item.id };
      }
    }
  }

  return { isDuplicate: false, canonicalUrl, contentHash };
};

module.exports = {
  checkDuplicate,
  jaccardSimilarity
};
