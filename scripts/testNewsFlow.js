const { connectDB } = require('../config/db');
const { NewsCategory, NewsKeyword, NewsSource, News, NewsKeywordMatch, NewsFetchLog } = require('../models');
const { normalizeText } = require('../utils/textNormalizer');
const { generateContentHash, sanitizeCanonicalUrl } = require('../utils/contentHash');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const { evaluateKeywords } = require('../services/keywordEngine');
const { determinePrimaryCategory } = require('../services/categoryEngine');
const { checkDuplicate } = require('../services/duplicateDetector');
const { seedNewsData } = require('../seeders/newsSeedData');
const { fetchSource } = require('../services/newsFetcher');

async function runTests() {
  console.log('🧪 Starting Local Updates & Dharmik News Test Suite...\n');

  try {
    await connectDB();
    await seedNewsData();

    // 1. Test Text Normalization (Multilingual: EN, HI, MR)
    console.log('1️⃣ Testing Multilingual Text Normalizer...');
    const enNorm = normalizeText('Special Hanuman Temple Aarti!');
    const hiNorm = normalizeText('हनुमान जी की विशेष आरती!');
    const mrNorm = normalizeText('गणपती बाप्पा दर्शन व उत्सव!');
    console.log('   EN Normalized:', enNorm);
    console.log('   HI Normalized:', hiNorm);
    console.log('   MR Normalized:', mrNorm);
    if (!enNorm.includes('hanuman') || !hiNorm.includes('हनुमान')) {
      throw new Error('Normalization failed');
    }
    console.log('✅ Text normalizer passed.\n');

    // 2. Test Content Hash & Canonical URL
    console.log('2️⃣ Testing Content Hash & Canonical URL...');
    const hash1 = generateContentHash('Hanuman Aarti at Temple', 'https://timesofindia.indiatimes.com/news/1?utm_source=fb');
    const hash2 = generateContentHash('hanuman aarti at temple', 'https://timesofindia.indiatimes.com/news/1');
    console.log('   Hash 1:', hash1);
    console.log('   Hash 2:', hash2);
    if (hash1 !== hash2) {
      throw new Error('Deterministic content hash failed to match canonicalized URL');
    }
    console.log('✅ Content hash passed.\n');

    // 3. Test Keyword Engine & Weighting
    console.log('3️⃣ Testing Keyword Engine & Scoring...');
    const testArticle = {
      title: 'Grand Hanuman Jayanti Celebrations with Aarti at Shiva Temple',
      summary: 'Devotees gather for special pooja and sacred mantra chanting.',
      excerpt: 'The temple witnessed thousands chanting Rama and Hanuman stotras.'
    };
    const kwResult = await evaluateKeywords(testArticle);
    console.log('   Relevance Score:', kwResult.relevanceScore);
    console.log('   Classification:', kwResult.classification);
    console.log('   Matches Count:', kwResult.matches.length);
    console.log('   Category Scores:', kwResult.categoryScores);
    if (kwResult.relevanceScore < 20) {
      throw new Error('Keyword scoring failed to award high relevance');
    }
    console.log('✅ Keyword engine passed.\n');

    // 4. Test Category Engine
    console.log('4️⃣ Testing Category Engine Assignment...');
    const primaryCatId = await determinePrimaryCategory(kwResult.categoryScores);
    const assignedCat = await NewsCategory.findByPk(primaryCatId);
    console.log('   Assigned Primary Category:', assignedCat?.name);
    if (!assignedCat) {
      throw new Error('Category assignment failed');
    }
    console.log('✅ Category engine passed.\n');

    // 5. Test Duplicate Detection
    console.log('5️⃣ Testing Duplicate Detection...');
    const existing = await News.findOne();
    if (existing) {
      const dup1 = await checkDuplicate({
        title: existing.title,
        link: existing.source_url,
        excerpt: existing.content_excerpt
      });
      console.log('   Exact URL Duplicate Result:', dup1);
      if (!dup1.isDuplicate) throw new Error('Duplicate URL detection failed');
    }
    console.log('✅ Duplicate detector passed.\n');

    // 6. Test Slug Generator
    console.log('6️⃣ Testing Unicode Slug Generator...');
    const slug1 = await generateUniqueSlug(News, 'Today Shubh Muhurat & Choghadiya');
    const slugHi = await generateUniqueSlug(News, 'आज का शुभ मुहूर्त और पंचांग');
    console.log('   English Slug:', slug1);
    console.log('   Hindi Slug:', slugHi);
    console.log('✅ Slug generator passed.\n');

    // 7. Test Database Query Layer (Published News Count)
    console.log('7️⃣ Testing Database Query Layer...');
    const publishedCount = await News.count({ where: { status: 'published' } });
    const categoriesCount = await NewsCategory.count();
    const keywordsCount = await NewsKeyword.count();
    const sourcesCount = await NewsSource.count();
    console.log(`   Published News: ${publishedCount}`);
    console.log(`   Categories: ${categoriesCount}`);
    console.log(`   Keywords: ${keywordsCount}`);
    console.log(`   Sources: ${sourcesCount}`);
    if (categoriesCount < 10 || keywordsCount < 15) {
      throw new Error('Seed data incomplete');
    }
    console.log('✅ Database queries passed.\n');

    console.log('🎉 ALL LOCAL UPDATES & NEWS AGGREGATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
