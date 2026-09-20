const { NewsCategory } = require('../models');

/**
 * Determine Primary Category for an article based on keyword match scores
 * @param {object} categoryScores { [categoryId]: score }
 * @param {string} [fallbackCategoryId]
 * @returns {Promise<string|null>} Primary category UUID
 */
const determinePrimaryCategory = async (categoryScores = {}, fallbackCategoryId = null) => {
  const categoryIds = Object.keys(categoryScores);

  if (categoryIds.length > 0) {
    // Sort categories by aggregated score descending
    categoryIds.sort((a, b) => categoryScores[b] - categoryScores[a]);
    return categoryIds[0];
  }

  if (fallbackCategoryId) {
    return fallbackCategoryId;
  }

  // Fallback to "Dharmik" or general category in DB
  const defaultCat = await NewsCategory.findOne({
    where: { slug: 'dharmik', is_active: true }
  });

  return defaultCat ? defaultCat.id : null;
};

module.exports = {
  determinePrimaryCategory
};
