/**
 * Generate SEO-friendly slug supporting Latin and Unicode characters (Devanagari, etc.)
 */
const generateSlug = (text) => {
  if (!text || typeof text !== 'string') {
    return `update-${Date.now()}`;
  }

  let slug = text
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-') // Replace whitespace and underscores with hyphens
    .replace(/[^\p{L}\p{N}\-]/gu, '') // Keep letters, numbers, and hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens

  if (!slug) {
    slug = `update-${Date.now()}`;
  }

  return slug.slice(0, 500);
};

/**
 * Generate a guaranteed unique slug for a given Model
 */
const generateUniqueSlug = async (Model, text, existingId = null) => {
  let baseSlug = generateSlug(text);
  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const where = { slug: uniqueSlug };
    const existing = await Model.findOne({ where });

    if (!existing || (existingId && existing.id === existingId)) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
};

module.exports = {
  generateSlug,
  generateUniqueSlug
};
