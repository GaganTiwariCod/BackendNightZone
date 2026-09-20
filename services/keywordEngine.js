const { NewsKeyword } = require('../models');
const { normalizeText } = require('../utils/textNormalizer');

const WEIGHT_MULTIPLIERS = {
  TITLE: 2.0,
  SUMMARY: 1.5,
  CONTENT: 1.0
};

const RELEVANCE_THRESHOLDS = {
  IRRELEVANT: 4,
  LOW: 9,
  RELEVANT: 19,
  HIGH: 20
};

/**
 * Match active keywords against article text
 * @param {object} article { title, summary, excerpt }
 * @param {Array<NewsKeyword>} [keywordsCache]
 * @returns {Promise<{ relevanceScore: number, classification: string, matches: Array<object>, categoryScores: object }>}
 */
const evaluateKeywords = async (article, keywordsCache = null) => {
  const keywords = keywordsCache || await NewsKeyword.findAll({
    where: { is_active: true }
  });

  const normTitle = normalizeText(article.title);
  const normSummary = normalizeText(article.summary);
  const normExcerpt = normalizeText(article.excerpt || article.content_excerpt);

  let totalScore = 0;
  const matches = [];
  const categoryScores = {}; // { [categoryId]: totalScoreForCategory }

  for (const kw of keywords) {
    const normKw = normalizeText(kw.normalized_keyword || kw.keyword);
    if (!normKw) continue;

    let matchedInTitle = false;
    let matchedInSummary = false;
    let matchedInContent = false;
    let kwScore = 0;

    // Check Title
    if (kw.match_title && normTitle.includes(normKw)) {
      matchedInTitle = true;
      kwScore += (kw.weight || 10) * WEIGHT_MULTIPLIERS.TITLE;
    }

    // Check Summary
    if (kw.match_description && normSummary.includes(normKw)) {
      matchedInSummary = true;
      kwScore += (kw.weight || 10) * WEIGHT_MULTIPLIERS.SUMMARY;
    }

    // Check Content / Excerpt
    if (kw.match_content && normExcerpt.includes(normKw)) {
      matchedInContent = true;
      kwScore += (kw.weight || 10) * WEIGHT_MULTIPLIERS.CONTENT;
    }

    if (matchedInTitle || matchedInSummary || matchedInContent) {
      totalScore += kwScore;
      matches.push({
        keywordId: kw.id,
        matchedText: kw.keyword,
        score: Math.round(kwScore),
        categoryId: kw.category_id
      });

      if (kw.category_id) {
        categoryScores[kw.category_id] = (categoryScores[kw.category_id] || 0) + kwScore;
      }
    }
  }

  // Determine classification bucket
  let classification = 'irrelevant';
  if (totalScore >= RELEVANCE_THRESHOLDS.HIGH) {
    classification = 'high';
  } else if (totalScore >= 10) {
    classification = 'relevant';
  } else if (totalScore >= 5) {
    classification = 'low';
  }

  return {
    relevanceScore: Math.round(totalScore),
    classification,
    matches,
    categoryScores
  };
};

module.exports = {
  evaluateKeywords,
  WEIGHT_MULTIPLIERS,
  RELEVANCE_THRESHOLDS
};
