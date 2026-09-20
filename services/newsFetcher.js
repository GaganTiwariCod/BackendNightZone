const { News, NewsSource, NewsKeyword, NewsKeywordMatch, NewsLocation, NewsFetchLog } = require('../models');
const { parseRssFeed } = require('../parsers/rssParser');
const { getScraper } = require('../scrapers');
const { checkDuplicate } = require('./duplicateDetector');
const classificationService = require('./classificationService');
const { generateUniqueSlug } = require('../utils/slugGenerator');

/**
 * Fetch and process articles for a single NewsSource
 * @param {NewsSource|string} sourceOrId
 * @returns {Promise<object>} Fetch statistics
 */
const fetchSource = async (sourceOrId) => {
  let source = sourceOrId;
  if (typeof sourceOrId === 'string') {
    source = await NewsSource.findByPk(sourceOrId);
  }

  if (!source) {
    throw new Error('News Source not found');
  }

  const log = await NewsFetchLog.create({
    source_id: source.id,
    started_at: new Date(),
    status: 'running'
  });

  const stats = {
    sourceId: source.id,
    sourceName: source.name,
    articlesFound: 0,
    articlesAdded: 0,
    duplicatesFound: 0,
    errorsCount: 0,
    errorMessage: null
  };

  try {
    let rawArticles = [];

    // 1. Ingestion by Source Type
    if (source.source_type === 'rss') {
      if (!source.feed_url) throw new Error('RSS feed URL is missing');
      rawArticles = await parseRssFeed(source.feed_url);
    } else if (source.source_type === 'scraper') {
      const scraper = getScraper(source);
      rawArticles = await scraper.fetchArticles();
    } else {
      throw new Error(`Unsupported source type: ${source.source_type}`);
    }

    stats.articlesFound = rawArticles.length;

    // Cache active keywords to avoid repeated queries in loop
    const activeKeywords = await NewsKeyword.findAll({ where: { is_active: true } });

    // 2. Process each article
    for (const article of rawArticles) {
      try {
        if (!article.title || !article.link) continue;

        // Duplicate Check
        const dupCheck = await checkDuplicate(article);
        if (dupCheck.isDuplicate) {
          stats.duplicatesFound++;
          continue;
        }

        // Classification
        const classification = await classificationService.classify(article, {
          keywordsCache: activeKeywords,
          defaultCategoryId: null
        });

        // Generate unique slug
        const slug = await generateUniqueSlug(News, article.title);

        // Save article to DB
        const createdNews = await News.create({
          source_id: source.id,
          category_id: classification.primaryCategoryId,
          title: article.title.trim().slice(0, 500),
          slug,
          summary: article.summary ? article.summary.trim() : null,
          content_excerpt: article.excerpt ? article.excerpt.trim() : null,
          source_url: dupCheck.canonicalUrl || article.link,
          image_url: article.imageUrl || null,
          author: article.author || source.name,
          language: source.language || 'en',
          location: source.location || null,
          published_at: article.publishedAt || new Date(),
          fetched_at: new Date(),
          content_hash: dupCheck.contentHash,
          canonical_url: dupCheck.canonicalUrl || article.link,
          relevance_score: classification.relevanceScore,
          status: 'pending', // Default to pending for admin moderation
          is_featured: false,
          is_breaking: false,
          is_verified: true,
          view_count: 0
        });

        // Save Keyword Match records
        if (classification.matches && classification.matches.length > 0) {
          const matchRecords = classification.matches.map(m => ({
            news_id: createdNews.id,
            keyword_id: m.keywordId,
            matched_text: m.matchedText,
            score: m.score
          }));
          await NewsKeywordMatch.bulkCreate(matchRecords, { ignoreDuplicates: true });
        }

        // Save location record if source has location
        if (source.location) {
          await NewsLocation.create({
            news_id: createdNews.id,
            country: source.country || 'India',
            city: source.location
          });
        }

        stats.articlesAdded++;
      } catch (itemErr) {
        console.error(`Error processing article from source ${source.name}:`, itemErr.message);
        stats.errorsCount++;
      }
    }

    // Update Source Metadata
    await source.update({
      last_fetched_at: new Date(),
      last_success_at: new Date(),
      last_error_message: null,
      total_articles_fetched: (source.total_articles_fetched || 0) + stats.articlesAdded
    });

    // Finalize Log
    await log.update({
      completed_at: new Date(),
      status: stats.errorsCount > 0 ? (stats.articlesAdded > 0 ? 'partial' : 'failed') : 'success',
      articles_found: stats.articlesFound,
      articles_added: stats.articlesAdded,
      duplicates_found: stats.duplicatesFound,
      errors_count: stats.errorsCount
    });

    return stats;
  } catch (sourceErr) {
    console.error(`Fetch failure for source ${source.name}:`, sourceErr.message);
    stats.errorMessage = sourceErr.message;
    stats.errorsCount++;

    await source.update({
      last_fetched_at: new Date(),
      last_error_at: new Date(),
      last_error_message: sourceErr.message
    });

    await log.update({
      completed_at: new Date(),
      status: 'failed',
      error_message: sourceErr.message,
      errors_count: stats.errorsCount
    });

    return stats;
  }
};

/**
 * Fetch all due active sources based on their fetch_interval_minutes
 */
const fetchAllDueSources = async () => {
  const activeSources = await NewsSource.findAll({
    where: { is_active: true }
  });

  const now = new Date();
  const results = [];

  for (const source of activeSources) {
    const intervalMinutes = source.fetch_interval_minutes || 60;
    const lastFetched = source.last_fetched_at ? new Date(source.last_fetched_at) : null;

    const isDue = !lastFetched || (now.getTime() - lastFetched.getTime()) >= intervalMinutes * 60 * 1000;

    if (isDue) {
      console.log(`[NewsFetcher] Fetching due source: ${source.name} (Interval: ${intervalMinutes}m)`);
      try {
        const stat = await fetchSource(source);
        results.push(stat);
      } catch (err) {
        console.error(`[NewsFetcher] Error fetching source ${source.name}:`, err.message);
      }
    }
  }

  return results;
};

module.exports = {
  fetchSource,
  fetchAllDueSources
};
