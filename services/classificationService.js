const { evaluateKeywords } = require('./keywordEngine');
const { determinePrimaryCategory } = require('./categoryEngine');

/**
 * Classification Service abstraction
 * Supports current keyword engine and future AI classifier plugins
 */
class ClassificationService {
  constructor(strategy = 'keyword') {
    this.strategy = strategy;
  }

  async classify(article, options = {}) {
    if (this.strategy === 'keyword') {
      const keywordResult = await evaluateKeywords(article, options.keywordsCache);
      const primaryCategoryId = await determinePrimaryCategory(
        keywordResult.categoryScores,
        options.defaultCategoryId
      );

      return {
        strategy: 'keyword',
        relevanceScore: keywordResult.relevanceScore,
        classification: keywordResult.classification,
        primaryCategoryId,
        matches: keywordResult.matches
      };
    }

    // Future AI classification hook
    throw new Error(`Unsupported classification strategy: ${this.strategy}`);
  }
}

module.exports = new ClassificationService('keyword');
