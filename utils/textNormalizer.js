/**
 * Multilingual Unicode Text Normalizer (Hindi, Marathi, English)
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ') // keep unicode letters, marks/matras, numbers and spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Tokenize text into words / n-grams
 */
const tokenize = (text) => {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(' ').filter(t => t.length > 0);
};

module.exports = {
  normalizeText,
  tokenize
};
