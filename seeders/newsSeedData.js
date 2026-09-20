const { NewsCategory, NewsKeyword, NewsSource, News, NewsKeywordMatch } = require('../models');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const { generateContentHash } = require('../utils/contentHash');

const CATEGORIES_DATA = [
  { name: 'Dharmik', slug: 'dharmik', icon: 'Sparkles', sort_order: 1, description: 'Core Dharmik & Sanatan Dharma news and spiritual insights.' },
  { name: 'Astrology', slug: 'astrology', icon: 'Moon', sort_order: 2, description: 'Vedic astrology, planetary movements, and cosmic predictions.' },
  { name: 'Rashifal', slug: 'rashifal', icon: 'Compass', sort_order: 3, description: 'Daily, weekly, and monthly zodiac forecasts.' },
  { name: 'Panchang', slug: 'panchang', icon: 'Calendar', sort_order: 4, description: 'Tithi, Nakshatra, Yoga, Karana, and Shubh Muhurats.' },
  { name: 'Temple', slug: 'temple', icon: 'Landmark', sort_order: 5, description: 'Famous temple updates, darshan timings, and renovations.' },
  { name: 'Festival', slug: 'festival', icon: 'Flame', sort_order: 6, description: 'Vedic festivals, vrat dates, and celebration traditions.' },
  { name: 'Pooja', slug: 'pooja', icon: 'Sun', sort_order: 7, description: 'Pooja vidhi, samagri, and auspicious ritual procedures.' },
  { name: 'Aarti', slug: 'aarti', icon: 'Bell', sort_order: 8, description: 'Sacred aartis, daily bhajans, and stutis.' },
  { name: 'Gods', slug: 'gods', icon: 'Crown', sort_order: 9, description: 'Deity stories, leelas, and divine avatars.' },
  { name: 'Mantra', slug: 'mantra', icon: 'Zap', sort_order: 10, description: 'Vedic mantras, stotras, and chanting benefits.' },
  { name: 'Vastu', slug: 'vastu', icon: 'Home', sort_order: 11, description: 'Vastu Shastra tips for home, office, and peace.' },
  { name: 'Spiritual', slug: 'spiritual', icon: 'HeartHandshake', sort_order: 12, description: 'Spiritual discourses, meditation, and life guidance.' },
  { name: 'Local Events', slug: 'local-events', icon: 'MapPin', sort_order: 13, description: 'Local dharmik gatherings, satsangs, and community yatras.' }
];

const KEYWORDS_DATA = [
  // English Keywords
  { keyword: 'Hanuman', language: 'en', categorySlug: 'gods', weight: 10 },
  { keyword: 'Shiva', language: 'en', categorySlug: 'gods', weight: 10 },
  { keyword: 'Krishna', language: 'en', categorySlug: 'gods', weight: 10 },
  { keyword: 'Ram', language: 'en', categorySlug: 'gods', weight: 10 },
  { keyword: 'Durga', language: 'en', categorySlug: 'gods', weight: 10 },
  { keyword: 'Ganesh', language: 'en', categorySlug: 'gods', weight: 10 },
  { keyword: 'Temple', language: 'en', categorySlug: 'temple', weight: 8 },
  { keyword: 'Mandir', language: 'en', categorySlug: 'temple', weight: 8 },
  { keyword: 'Pooja', language: 'en', categorySlug: 'pooja', weight: 9 },
  { keyword: 'Aarti', language: 'en', categorySlug: 'aarti', weight: 9 },
  { keyword: 'Navratri', language: 'en', categorySlug: 'festival', weight: 10 },
  { keyword: 'Diwali', language: 'en', categorySlug: 'festival', weight: 10 },
  { keyword: 'Ekadashi', language: 'en', categorySlug: 'panchang', weight: 10 },
  { keyword: 'Panchang', language: 'en', categorySlug: 'panchang', weight: 10 },
  { keyword: 'Rashifal', language: 'en', categorySlug: 'rashifal', weight: 10 },
  { keyword: 'Horoscope', language: 'en', categorySlug: 'rashifal', weight: 10 },
  { keyword: 'Astrology', language: 'en', categorySlug: 'astrology', weight: 9 },
  { keyword: 'Kundli', language: 'en', categorySlug: 'astrology', weight: 9 },
  { keyword: 'Vastu', language: 'en', categorySlug: 'vastu', weight: 10 },
  { keyword: 'Mantra', language: 'en', categorySlug: 'mantra', weight: 9 },
  { keyword: 'Satsang', language: 'en', categorySlug: 'local-events', weight: 8 },

  // Hindi Keywords
  { keyword: 'हनुमान', language: 'hi', categorySlug: 'gods', weight: 10 },
  { keyword: 'शिव', language: 'hi', categorySlug: 'gods', weight: 10 },
  { keyword: 'कृष्ण', language: 'hi', categorySlug: 'gods', weight: 10 },
  { keyword: 'राम', language: 'hi', categorySlug: 'gods', weight: 10 },
  { keyword: 'दुर्गा', language: 'hi', categorySlug: 'gods', weight: 10 },
  { keyword: 'गणेश', language: 'hi', categorySlug: 'gods', weight: 10 },
  { keyword: 'पूजा', language: 'hi', categorySlug: 'pooja', weight: 9 },
  { keyword: 'आरती', language: 'hi', categorySlug: 'aarti', weight: 9 },
  { keyword: 'मंदिर', language: 'hi', categorySlug: 'temple', weight: 8 },
  { keyword: 'नवरात्रि', language: 'hi', categorySlug: 'festival', weight: 10 },
  { keyword: 'दीवाली', language: 'hi', categorySlug: 'festival', weight: 10 },
  { keyword: 'एकादशी', language: 'hi', categorySlug: 'panchang', weight: 10 },
  { keyword: 'राशिफल', language: 'hi', categorySlug: 'rashifal', weight: 10 },
  { keyword: 'ज्योतिष', language: 'hi', categorySlug: 'astrology', weight: 9 },
  { keyword: 'पंचांग', language: 'hi', categorySlug: 'panchang', weight: 10 },
  { keyword: 'वास्तु', language: 'hi', categorySlug: 'vastu', weight: 10 },
  { keyword: 'मंत्र', language: 'hi', categorySlug: 'mantra', weight: 9 },

  // Marathi Keywords
  { keyword: 'सण', language: 'mr', categorySlug: 'festival', weight: 8 },
  { keyword: 'राशीभविष्य', language: 'mr', categorySlug: 'rashifal', weight: 10 },
  { keyword: 'दर्शन', language: 'mr', categorySlug: 'temple', weight: 8 },
  { keyword: 'व्रत', language: 'mr', categorySlug: 'panchang', weight: 8 }
];

const SOURCES_DATA = [
  {
    name: 'Dharmik Varta & Astrology Feed (Demo Source)',
    source_type: 'rss',
    base_url: 'https://timesofindia.indiatimes.com',
    feed_url: 'https://timesofindia.indiatimes.com/rssfeeds/2886704.cms',
    language: 'en',
    country: 'India',
    location: 'Mumbai',
    is_active: true,
    fetch_interval_minutes: 60
  },
  {
    name: 'Sanatan Spiritual Discourse (Demo Source)',
    source_type: 'rss',
    base_url: 'https://feeds.feedburner.com',
    feed_url: 'https://feeds.feedburner.com/spiritual-discourses',
    language: 'hi',
    country: 'India',
    location: 'Varanasi',
    is_active: false,
    fetch_interval_minutes: 120
  }
];

const DEMO_ARTICLES = [
  {
    title: 'Special Hanuman Jayanti Maha Aarti and Sundarkand Paath Organized in Mumbai',
    summary: 'Devotees gather in large numbers across Maharashtra for sacred Hanuman Pooja, temple bhajans, and special divine prasadam distribution.',
    content_excerpt: 'Temples in Mumbai, Pune, and Nagpur witnessed extensive early morning celebrations with traditional chanting of Hanuman Chalisa and 108 Aarti recitations for spiritual harmony.',
    source_url: 'https://example-dharmik-news.com/demo/hanuman-jayanti-mumbai',
    image_url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&auto=format&fit=crop&q=80',
    categorySlug: 'temple',
    author: 'Dharmik Samachar Desk',
    language: 'en',
    location: 'Mumbai',
    relevance_score: 28,
    is_featured: true,
    is_breaking: true,
    status: 'published'
  },
  {
    title: 'Weekly Horoscope: Planetary Transit of Jupiter in Taurus and Astrological Impact',
    summary: 'Discover how the transit of Guru Brihaspati influences all 12 zodiac signs with auspicious Muhurats and career opportunities.',
    content_excerpt: 'Vedic astrologers highlight key remedies for Mesha, Vrishabha, and Mithuna rashi, recommending yellow sapphire and Shiva Panchakshar mantra chanting.',
    source_url: 'https://example-dharmik-news.com/demo/weekly-horoscope-jupiter-transit',
    image_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
    categorySlug: 'rashifal',
    author: 'Acharya Vidyadhar',
    language: 'en',
    location: 'India',
    relevance_score: 24,
    is_featured: true,
    is_breaking: false,
    status: 'published'
  },
  {
    title: 'Shubh Muhurat for Nirjala Ekadashi Vrat and Sacred Tulsi Pooja Vidhi',
    summary: 'Everything you need to know about the auspicious Nirjala Ekadashi timings, fasting rules, and holy Vishnu Sahasranama chanting.',
    content_excerpt: 'Nirjala Ekadashi is celebrated as one of the most sacred vrat days in the Hindu calendar. The Parana timing is scheduled for the following sunrise.',
    source_url: 'https://example-dharmik-news.com/demo/nirjala-ekadashi-pooja-vidhi',
    image_url: 'https://images.unsplash.com/photo-1609137144822-4467005c2199?w=800&auto=format&fit=crop&q=80',
    categorySlug: 'panchang',
    author: 'Pandit Sharma',
    language: 'en',
    location: 'Varanasi',
    relevance_score: 22,
    is_featured: false,
    is_breaking: false,
    status: 'published'
  },
  {
    title: 'Essential Vastu Tips for Home Entrance and North-East Direction to Enhance Positive Energy',
    summary: 'Simple and practical Vastu Shastra recommendations to invite prosperity, peaceful family relationships, and divine blessings into your home.',
    content_excerpt: 'Placing clean water containers, holy basil (Tulsi), and maintaining an unobstructed entryway allows pure cosmic prana to flow effortlessly.',
    source_url: 'https://example-dharmik-news.com/demo/vastu-tips-home-entrance',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    categorySlug: 'vastu',
    author: 'Vastu Consultant Rao',
    language: 'en',
    location: 'Pune',
    relevance_score: 20,
    is_featured: false,
    is_breaking: false,
    status: 'published'
  }
];

const seedNewsData = async () => {
  try {
    // 1. Seed Categories
    const categoryMap = {};
    for (const catData of CATEGORIES_DATA) {
      let [cat] = await NewsCategory.findOrCreate({
        where: { slug: catData.slug },
        defaults: catData
      });
      categoryMap[catData.slug] = cat.id;
    }

    // 2. Seed Keywords
    for (const kwData of KEYWORDS_DATA) {
      const categoryId = categoryMap[kwData.categorySlug] || null;
      await NewsKeyword.findOrCreate({
        where: {
          keyword: kwData.keyword,
          language: kwData.language
        },
        defaults: {
          keyword: kwData.keyword,
          normalized_keyword: kwData.keyword.toLowerCase().trim(),
          language: kwData.language,
          category_id: categoryId,
          weight: kwData.weight,
          match_title: true,
          match_description: true,
          match_content: true,
          is_active: true
        }
      });
    }

    // 3. Seed Sources
    const sourceMap = {};
    for (const srcData of SOURCES_DATA) {
      let [src] = await NewsSource.findOrCreate({
        where: { name: srcData.name },
        defaults: srcData
      });
      sourceMap[srcData.name] = src.id;
    }

    // 4. Seed Demo Articles if news table is empty
    const newsCount = await News.count();
    if (newsCount === 0) {
      const firstSource = await NewsSource.findOne();
      for (const art of DEMO_ARTICLES) {
        const categoryId = categoryMap[art.categorySlug] || Object.values(categoryMap)[0];
        const slug = await generateUniqueSlug(News, art.title);
        const contentHash = generateContentHash(art.title, art.source_url, art.content_excerpt);

        await News.create({
          source_id: firstSource ? firstSource.id : null,
          category_id: categoryId,
          title: art.title,
          slug,
          summary: art.summary,
          content_excerpt: art.content_excerpt,
          source_url: art.source_url,
          image_url: art.image_url,
          author: art.author,
          language: art.language,
          location: art.location,
          published_at: new Date(),
          fetched_at: new Date(),
          content_hash: contentHash,
          canonical_url: art.source_url,
          relevance_score: art.relevance_score,
          status: art.status,
          is_featured: art.is_featured,
          is_breaking: art.is_breaking,
          is_verified: true,
          view_count: Math.floor(Math.random() * 50) + 10
        });
      }
      console.log('✅ Local Updates & Dharmik News Seed Data populated successfully!');
    }
  } catch (error) {
    console.error('Error seeding News data:', error);
  }
};

module.exports = {
  seedNewsData,
  CATEGORIES_DATA,
  KEYWORDS_DATA,
  SOURCES_DATA
};
