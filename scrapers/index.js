const BaseScraper = require('./baseScraper');

const registry = {};

/**
 * Register a scraper implementation
 */
const registerScraper = (sourceKey, ScraperClass) => {
  registry[sourceKey] = ScraperClass;
};

/**
 * Get scraper instance for a source
 */
const getScraper = (sourceConfig) => {
  const key = sourceConfig.slug || sourceConfig.name;
  const ScraperClass = registry[key] || BaseScraper;
  return new ScraperClass(sourceConfig);
};

module.exports = {
  BaseScraper,
  registerScraper,
  getScraper
};
