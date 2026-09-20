const { 
  sequelize, 
  User, 
  AstrologyCategory, 
  AstrologyService, 
  AstrologerProfile, 
  AstrologerAvailability 
} = require('../models');
const bcrypt = require('bcryptjs');

const seedAstrologyData = async () => {
  try {
    console.log('🔄 Checking & seeding Astrology categories and services...');

    // 1. Categories
    const categoriesData = [
      {
        name: 'Kundli & Birth Chart',
        slug: 'kundli-birth-chart',
        icon: 'Sparkles',
        description: 'Detailed Vedic birth chart reading, planetary positions, and Dasha calculations.',
        sort_order: 1
      },
      {
        name: 'Kundli Matching',
        slug: 'kundli-matching',
        icon: 'Heart',
        description: 'Ashtakoot 36 Guna Milan and Dosha compatibility analysis for marriage.',
        sort_order: 2
      },
      {
        name: 'Career & Business',
        slug: 'career-business',
        icon: 'Briefcase',
        description: 'Job promotions, career transitions, business investments, and financial growth.',
        sort_order: 3
      },
      {
        name: 'Marriage & Relationship',
        slug: 'marriage-relationship',
        icon: 'Users',
        description: 'Timing of marriage, partner compatibility, harmony, and relationship guidance.',
        sort_order: 4
      },
      {
        name: 'Vastu Shastra',
        slug: 'vastu-shastra',
        icon: 'Home',
        description: 'Vedic architectural guidance for residential harmony, shops, and corporate spaces.',
        sort_order: 5
      },
      {
        name: 'Numerology',
        slug: 'numerology',
        icon: 'Hash',
        description: 'Name correction, life path number, lucky dates, and destiny insights.',
        sort_order: 6
      },
      {
        name: 'Muhurta & Panchang',
        slug: 'muhurta-panchang',
        icon: 'Calendar',
        description: 'Auspicious timings for Griha Pravesh, weddings, business launch, and ceremonies.',
        sort_order: 7
      },
      {
        name: 'Dosha & Remedies',
        slug: 'dosha-remedies',
        icon: 'Shield',
        description: 'Manglik dosha, Sade Sati, Kaal Sarp dosha analysis with spiritual remedies.',
        sort_order: 8
      }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const [record] = await AstrologyCategory.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat
      });
      categoryMap[cat.slug] = record.id;
    }

    // 2. Dynamic Services
    const servicesData = [
      {
        name: 'Kundli Generation & Detailed Analysis',
        slug: 'kundli-generation',
        category_id: categoryMap['kundli-birth-chart'],
        short_description: 'Complete Vedic birth chart with planetary placements, houses & Mahadasha analysis.',
        description: 'Receive an in-depth astrological analysis covering your Lagna chart, Navamsha chart, planetary strengths, favorable gemstones, and life predictions.',
        icon: 'BookOpen',
        pricing: 299.00,
        duration_minutes: 30,
        sort_order: 1,
        birth_details_required: true,
        partner_details_required: false,
        report_supported: true
      },
      {
        name: 'Kundli Matching (36 Guna Milan)',
        slug: 'kundli-matching-service',
        category_id: categoryMap['kundli-matching'],
        short_description: 'Comprehensive 36 Guna Ashtakoot matching for marriage compatibility and dosha evaluation.',
        description: 'Full compatibility report analyzing Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi with Manglik Dosha assessment.',
        icon: 'HeartHandshake',
        pricing: 399.00,
        duration_minutes: 30,
        sort_order: 2,
        birth_details_required: true,
        partner_details_required: true,
        report_supported: true
      },
      {
        name: 'Career & Job Astrological Guidance',
        slug: 'career-astrology',
        category_id: categoryMap['career-business'],
        short_description: 'Gain clarity on career changes, promotions, exams, and ideal professional domains.',
        description: 'Understand the 10th house influences, current Dasha impacts on your profession, and strategic remedy guidance.',
        icon: 'TrendingUp',
        pricing: 499.00,
        duration_minutes: 30,
        sort_order: 3,
        birth_details_required: true,
        partner_details_required: false,
        report_supported: true
      },
      {
        name: 'Marriage & Love Astrology Consultation',
        slug: 'marriage-love-astrology',
        category_id: categoryMap['marriage-relationship'],
        short_description: 'Personalized guidance on marriage timing, delays, marital bliss, and partner harmony.',
        description: 'Vedic 7th house and Venus/Jupiter analysis providing actionable remedies for delay in marriage or matrimonial challenges.',
        icon: 'Flame',
        pricing: 499.00,
        duration_minutes: 30,
        sort_order: 4,
        birth_details_required: true,
        partner_details_required: false,
        report_supported: true
      },
      {
        name: 'Vastu Consultation for Home & Workplace',
        slug: 'vastu-consultation',
        category_id: categoryMap['vastu-shastra'],
        short_description: 'Align your living or business space with cosmic energies without major demolition.',
        description: 'Comprehensive directional analysis, energy flow optimization, and remedies for Vastu doshas.',
        icon: 'Compass',
        pricing: 799.00,
        duration_minutes: 45,
        sort_order: 5,
        birth_details_required: false,
        partner_details_required: false,
        report_supported: true
      },
      {
        name: 'Numerology & Name Correction',
        slug: 'numerology-analysis',
        category_id: categoryMap['numerology'],
        short_description: 'Unlock favorable vibrations through birth date numerology and optimal name spelling.',
        description: 'Detailed analysis of Psychic Number, Destiny Number, lucky colors, favorable days, and brand name compatibility.',
        icon: 'Hash',
        pricing: 349.00,
        duration_minutes: 30,
        sort_order: 6,
        birth_details_required: true,
        partner_details_required: false,
        report_supported: true
      },
      {
        name: 'Shubh Muhurta Calculation',
        slug: 'shubh-muhurta',
        category_id: categoryMap['muhurta-panchang'],
        short_description: 'Accurate auspicious time calculation for weddings, Griha Pravesh, and business launches.',
        description: 'Tithi, Nakshatra, Yoga, and Karana alignment to choose the most prosperous planetary moment for important milestones.',
        icon: 'Clock',
        pricing: 249.00,
        duration_minutes: 20,
        sort_order: 7,
        birth_details_required: true,
        partner_details_required: false,
        report_supported: true
      },
      {
        name: 'Manglik & Sade Sati Dosha Analysis',
        slug: 'dosha-analysis',
        category_id: categoryMap['dosha-remedies'],
        short_description: 'Identify planetary afflictions and recommended Vedic pujas, mantras, and gemstones.',
        description: 'In-depth assessment of Saturn Sade Sati phases, Rahu-Ketu Kaal Sarp dosha, Pitra dosha, and personalized spiritual remedies.',
        icon: 'ShieldCheck',
        pricing: 449.00,
        duration_minutes: 30,
        sort_order: 8,
        birth_details_required: true,
        partner_details_required: false,
        report_supported: true
      }
    ];

    for (const s of servicesData) {
      await AstrologyService.findOrCreate({
        where: { slug: s.slug },
        defaults: s
      });
    }

    // 3. Demo Verified Astrologers
    const astrologers = [
      {
        email: 'astrologer.vidyadhar@shubhkaal.com',
        name: 'Acharya Vidyadhar Sharma',
        phone: '9820011223',
        slug: 'acharya-vidyadhar-sharma',
        profile_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        bio: 'Gold Medalist in Vedic Jyotish with over 22 years of experience guiding thousands across the world in Kundli, Marriage matching, and Vedic remedies.',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        years_of_experience: 22,
        education: 'Shastri & Acharya (Sampurnanand Sanskrit University)',
        languages: ['Hindi', 'Sanskrit', 'English'],
        specializations: ['Vedic Astrology', 'Kundli', 'Kundli Matching', 'Marriage Astrology', 'Dosha Remedies'],
        astrology_methods: ['Parashari', 'Jaimini'],
        chat_price: 25.00,
        call_price: 35.00,
        video_price: 50.00,
        report_price: 699.00,
        status: 'VERIFIED',
        rating: 4.95,
        review_count: 342,
        consultation_count: 1420,
        is_featured: true,
        is_online: true
      },
      {
        email: 'astrologer.ananya@shubhkaal.com',
        name: 'Dr. Ananya Shastri',
        phone: '9820044556',
        slug: 'dr-ananya-shastri',
        profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        bio: 'PhD in Astrological Sciences with special focus on KP Astrology, Career Predictions, Numerology, and Corporate Guidance.',
        city: 'New Delhi',
        state: 'Delhi',
        years_of_experience: 16,
        education: 'PhD in Jyotish, Delhi University',
        languages: ['Hindi', 'English'],
        specializations: ['KP Astrology', 'Career Astrology', 'Numerology', 'Business Astrology', 'Finance'],
        astrology_methods: ['KP System', 'Nadi Astrology'],
        chat_price: 30.00,
        call_price: 45.00,
        video_price: 60.00,
        report_price: 899.00,
        status: 'VERIFIED',
        rating: 4.92,
        review_count: 218,
        consultation_count: 980,
        is_featured: true,
        is_online: true
      },
      {
        email: 'astrologer.rameshwar@shubhkaal.com',
        name: 'Pt. Rameshwar Dwivedi',
        phone: '9820077889',
        slug: 'pt-rameshwar-dwivedi',
        profile_photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        bio: 'Renowned Vastu consultant and Muhurta specialist with 18+ years of expertise helping families achieve peace, prosperity, and cosmic balance.',
        city: 'Ujjain',
        state: 'Madhya Pradesh',
        years_of_experience: 18,
        education: 'Vedic Vastu Acharya, Ujjain',
        languages: ['Hindi', 'Marathi', 'English'],
        specializations: ['Vastu Shastra', 'Muhurta', 'Palmistry', 'Spiritual Guidance'],
        astrology_methods: ['Vedic Vastu', 'Samudrika Shastra'],
        chat_price: 20.00,
        call_price: 30.00,
        video_price: 45.00,
        report_price: 599.00,
        status: 'VERIFIED',
        rating: 4.88,
        review_count: 164,
        consultation_count: 750,
        is_featured: true,
        is_online: true
      }
    ];

    const hashedPassword = await bcrypt.hash('Astrologer@123', 10);

    for (const a of astrologers) {
      let user = await User.findOne({ where: { email: a.email } });
      if (!user) {
        user = await User.create({
          name: a.name,
          email: a.email,
          phone: a.phone,
          password: hashedPassword,
          role: 'ASTROLOGER',
          is_email_verified: true,
          is_phone_verified: true
        });
      }

      const [profile] = await AstrologerProfile.findOrCreate({
        where: { user_id: user.id },
        defaults: {
          user_id: user.id,
          full_name: a.name,
          display_name: a.name,
          slug: a.slug,
          profile_photo: a.profile_photo,
          gender: 'male',
          bio: a.bio,
          phone: a.phone,
          city: a.city,
          state: a.state,
          years_of_experience: a.years_of_experience,
          education: a.education,
          languages: a.languages,
          specializations: a.specializations,
          astrology_methods: a.astrology_methods,
          chat_price: a.chat_price,
          call_price: a.call_price,
          video_price: a.video_price,
          report_price: a.report_price,
          status: a.status,
          rating: a.rating,
          review_count: a.review_count,
          consultation_count: a.consultation_count,
          is_featured: a.is_featured,
          is_online: a.is_online,
          is_active: true
        }
      });

      // Create weekly availability (Mon - Sun, 09:00 - 20:00)
      for (let day = 0; day <= 6; day++) {
        await AstrologerAvailability.findOrCreate({
          where: {
            astrologer_id: profile.id,
            day_of_week: day
          },
          defaults: {
            astrologer_id: profile.id,
            day_of_week: day,
            start_time: '09:00',
            end_time: '20:00',
            slot_duration_minutes: 30,
            break_start_time: '13:00',
            break_end_time: '14:00',
            timezone: 'Asia/Kolkata',
            max_consultations_per_day: 15,
            is_active: true
          }
        });
      }
    }

    console.log('✅ Astrology categories, services, and verified astrologers seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding astrology data:', err);
  }
};

module.exports = { seedAstrologyData };
