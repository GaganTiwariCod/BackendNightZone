/**
 * Base Scraper Interface
 * All permitted scrapers must extend this class and implement fetchArticles().
 */
class BaseScraper {
  constructor(sourceConfig = {}) {
    this.sourceConfig = sourceConfig;
    this.name = sourceConfig.name || 'BaseScraper';
    this.timeout = sourceConfig.timeout || 15000;
  }

  /**
   * Fetch and normalize articles from the source
   * @returns {Promise<Array<{title: string, link: string, summary: string, excerpt: string, imageUrl: string, publishedAt: Date}>>}
   */
  async fetchArticles() {
    throw new Error(`fetchArticles() must be implemented by ${this.constructor.name}`);
  }
}

module.exports = BaseScraper;
