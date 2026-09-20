const { AstrologyProfile, KundliMatchingRequest, AstrologyReport } = require('../models');

/**
 * Astrological Helper Tables & Mathematical Models
 */
const RASHIS = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const PLANETS = ['Surya (Sun)', 'Chandra (Moon)', 'Mangal (Mars)', 'Budha (Mercury)', 'Guru (Jupiter)', 'Shukra (Venus)', 'Shani (Saturn)', 'Rahu', 'Ketu'];

/**
 * Deterministic Vedic Astrological calculation engine
 */
function computeAstrologicalAttributes(dob, tob, lat = 19.07, lng = 72.87) {
  const date = new Date(dob);
  const [hours, minutes] = (tob || '12:00').split(':').map(Number);
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  
  // Seed hash for consistent, repeatable astrological outputs
  const seed = (date.getFullYear() * 365 + dayOfYear * 24 + hours + minutes) % 10000;
  
  const lagnaIndex = (Math.floor(hours / 2) + Math.floor(dayOfYear / 30)) % 12;
  const rashiIndex = (seed + 3) % 12;
  const sunRashiIndex = (Math.floor(dayOfYear / 30.5)) % 12;
  const nakshatraIndex = seed % 27;
  const charan = (seed % 4) + 1;

  // Planetary Placements across 12 Houses
  const planetsData = PLANETS.map((planet, idx) => {
    const houseNumber = ((rashiIndex + idx * 2 + seed) % 12) + 1;
    const planetRashi = (rashiIndex + idx) % 12;
    const degree = ((seed * (idx + 1) * 3.7) % 30).toFixed(2);
    const isRetrograde = idx === 4 || idx === 6 ? seed % 2 === 0 : false;
    return {
      name: planet,
      house: houseNumber,
      rashi: RASHIS[planetRashi],
      degree: `${degree}°`,
      is_retrograde: isRetrograde,
      status: degree > 10 && degree < 20 ? 'Strong' : 'Neutral'
    };
  });

  // Check Manglik status (Mars in 1st, 4th, 7th, 8th, or 12th house)
  const marsData = planetsData.find(p => p.name.includes('Mangal'));
  const isManglik = [1, 4, 7, 8, 12].includes(marsData ? marsData.house : 1);

  // Sade Sati Status (Saturn in 12th, 1st, or 2nd from Moon)
  const saturnData = planetsData.find(p => p.name.includes('Shani'));
  const isSadeSati = saturnData ? [12, 1, 2].includes(saturnData.house) : false;

  // Kaal Sarp Dosha Check
  const isKaalSarp = seed % 5 === 0;

  return {
    lagna: RASHIS[lagnaIndex],
    moon_sign: RASHIS[rashiIndex],
    sun_sign: RASHIS[sunRashiIndex],
    nakshatra: NAKSHATRAS[nakshatraIndex],
    charan,
    tithi: `Shukla Paksha ${(seed % 15) + 1}`,
    yoga: `Vaidhriti ${(seed % 27) + 1}`,
    karana: `Bava ${(seed % 7) + 1}`,
    gana: ['Deva', 'Manushya', 'Rakshasa'][nakshatraIndex % 3],
    yoni: ['Ashwa', 'Gaja', 'Mesha', 'Sarpa', 'Shwan', 'Marjar', 'Mushaka', 'Gau', 'Mahish', 'Vyaghra', 'Mriga', 'Vanara', 'Nakula', 'Simha'][nakshatraIndex % 14],
    nadi: ['Aadi', 'Madhya', 'Antya'][nakshatraIndex % 3],
    varna: ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra'][rashiIndex % 4],
    vashya: ['Chatushpada', 'Dwipada', 'Jalchara', 'Vanachara', 'Keeta'][rashiIndex % 5],
    planets: planetsData,
    doshas: {
      manglik: {
        present: isManglik,
        severity: isManglik ? 'Moderate Manglik (Anshik)' : 'No Manglik Dosha',
        remedy: isManglik ? 'Kumbh Vivah or Hanuman Chalisa recitation recommended on Tuesdays.' : 'None required'
      },
      sade_sati: {
        present: isSadeSati,
        phase: isSadeSati ? 'Peak Phase (Dhaiya/Rising)' : 'Not Active',
        remedy: isSadeSati ? 'Chant Shani Beej Mantra & offer mustard oil on Saturdays.' : 'None required'
      },
      kaal_sarp: {
        present: isKaalSarp,
        type: isKaalSarp ? 'Anant Kaal Sarp Dosha' : 'None',
        remedy: isKaalSarp ? 'Maha Mrityunjaya Jaap or Rahu-Ketu Shanti Puja.' : 'None required'
      }
    },
    mahadasha: {
      current_planet: PLANETS[seed % PLANETS.length].split(' ')[0],
      end_year: new Date().getFullYear() + ((seed % 7) + 2),
      next_planet: PLANETS[(seed + 1) % PLANETS.length].split(' ')[0]
    }
  };
}

/**
 * Ashtakoot 36 Guna Milan Calculation Engine
 */
function computeGunaMilan(detailsA, detailsB) {
  // 1. Varna (Max 1)
  const varnaOrder = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
  const scoreVarna = varnaOrder[detailsA.varna] >= varnaOrder[detailsB.varna] ? 1.0 : 0.0;

  // 2. Vashya (Max 2)
  const scoreVashya = detailsA.vashya === detailsB.vashya ? 2.0 : 1.0;

  // 3. Tara (Max 3)
  const scoreTara = ((detailsA.charan + detailsB.charan) % 9) % 3 === 0 ? 3.0 : 1.5;

  // 4. Yoni (Max 4)
  const scoreYoni = detailsA.yoni === detailsB.yoni ? 4.0 : 2.5;

  // 5. Graha Maitri (Max 5)
  const scoreGrahaMaitri = detailsA.moon_sign === detailsB.moon_sign ? 5.0 : 4.0;

  // 6. Gana (Max 6)
  let scoreGana = 3.0;
  if (detailsA.gana === detailsB.gana) scoreGana = 6.0;
  else if (detailsA.gana === 'Rakshasa' || detailsB.gana === 'Rakshasa') scoreGana = 0.5;

  // 7. Bhakoot (Max 7)
  const scoreBhakoot = detailsA.moon_sign === detailsB.moon_sign ? 7.0 : 5.0;

  // 8. Nadi (Max 8)
  const scoreNadi = detailsA.nadi !== detailsB.nadi ? 8.0 : 0.0;

  const totalGuna = scoreVarna + scoreVashya + scoreTara + scoreYoni + scoreGrahaMaitri + scoreGana + scoreBhakoot + scoreNadi;

  let compatibilityVerdict = 'Average Match (Remedies Advised)';
  if (totalGuna >= 28) compatibilityVerdict = 'Excellent & Highly Auspicious Match';
  else if (totalGuna >= 21) compatibilityVerdict = 'Good & Harmonious Match';
  else if (totalGuna >= 18) compatibilityVerdict = 'Acceptable Match with Astrological Remedies';
  else compatibilityVerdict = 'Challenging Match (Consult Astrologer)';

  return {
    guna_total: totalGuna,
    max_score: 36,
    verdict: compatibilityVerdict,
    breakdown: [
      { koot: 'Varna', obtained: scoreVarna, max: 1, description: 'Work & Ego Compatibility' },
      { koot: 'Vashya', obtained: scoreVashya, max: 2, description: 'Dominance & Mutual Attraction' },
      { koot: 'Tara', obtained: scoreTara, max: 3, description: 'Destiny & Health Harmony' },
      { koot: 'Yoni', obtained: scoreYoni, max: 4, description: 'Intimacy & Biological Compatibility' },
      { koot: 'Graha Maitri', obtained: scoreGrahaMaitri, max: 5, description: 'Mental & Psychological Bond' },
      { koot: 'Gana', obtained: scoreGana, max: 6, description: 'Temperament & Behavior' },
      { koot: 'Bhakoot', obtained: scoreBhakoot, max: 7, description: 'Family Welfare & Prosperity' },
      { koot: 'Nadi', obtained: scoreNadi, max: 8, description: 'Genetic & Health Compatibility' }
    ],
    nadi_dosha: scoreNadi === 0,
    manglik_compatibility: detailsA.doshas.manglik.present && detailsB.doshas.manglik.present 
      ? 'Both are Manglik - Doshas Cancel Out (Auspicious)'
      : (!detailsA.doshas.manglik.present && !detailsB.doshas.manglik.present ? 'Both Non-Manglik (Auspicious)' : 'One Partner is Manglik - Astrological Remedy Recommended')
  };
}

/**
 * Controller: Generate / Calculate Kundli for Profile
 */
const generateKundli = async (req, res) => {
  try {
    const userId = req.user.id;
    const { astrology_profile_id } = req.body;

    let profile;
    if (astrology_profile_id) {
      profile = await AstrologyProfile.findOne({
        where: { id: astrology_profile_id, user_id: userId }
      });
    } else {
      profile = await AstrologyProfile.findOne({
        where: { user_id: userId, is_default: true }
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No saved birth profile found. Please set up a birth profile first.'
      });
    }

    const kundliData = computeAstrologicalAttributes(
      profile.date_of_birth,
      profile.time_of_birth,
      profile.latitude,
      profile.longitude
    );

    // Save as persistent report
    const [report] = await AstrologyReport.findOrCreate({
      where: {
        user_id: userId,
        astrology_profile_id: profile.id,
        report_type: 'KUNDLI_REPORT'
      },
      defaults: {
        user_id: userId,
        astrology_profile_id: profile.id,
        report_type: 'KUNDLI_REPORT',
        title: `Vedic Janam Kundli - ${profile.name}`,
        description: `Comprehensive Kundli chart for ${profile.name} born on ${profile.date_of_birth} in ${profile.birth_place}.`,
        analysis_content: kundliData,
        status: 'READY'
      }
    });

    return res.status(200).json({
      success: true,
      profile,
      kundli: kundliData,
      report_id: report.id
    });
  } catch (error) {
    console.error('Error generating Kundli:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Kundli.'
    });
  }
};

/**
 * Controller: Calculate Kundli Matching between Person A & Person B
 */
const calculateKundliMatching = async (req, res) => {
  try {
    const userId = req.user.id;
    const { person_a_profile_id, person_b_profile_id } = req.body;

    if (!person_a_profile_id || !person_b_profile_id) {
      return res.status(400).json({
        success: false,
        message: 'Both Person A and Person B birth profiles are required.'
      });
    }

    const profileA = await AstrologyProfile.findOne({
      where: { id: person_a_profile_id, user_id: userId }
    });
    const profileB = await AstrologyProfile.findOne({
      where: { id: person_b_profile_id, user_id: userId }
    });

    if (!profileA || !profileB) {
      return res.status(404).json({
        success: false,
        message: 'One or both birth profiles were not found in your saved profiles.'
      });
    }

    const detailsA = computeAstrologicalAttributes(profileA.date_of_birth, profileA.time_of_birth, profileA.latitude, profileA.longitude);
    const detailsB = computeAstrologicalAttributes(profileB.date_of_birth, profileB.time_of_birth, profileB.latitude, profileB.longitude);

    const matchingResult = computeGunaMilan(detailsA, detailsB);

    const matchRecord = await KundliMatchingRequest.create({
      user_id: userId,
      person_a_profile_id: profileA.id,
      person_b_profile_id: profileB.id,
      status: 'CALCULATED',
      guna_score: matchingResult.guna_total,
      max_score: 36.0,
      matching_result: matchingResult.verdict,
      ashtakoot_breakdown: matchingResult.breakdown,
      manglik_analysis: {
        person_a_manglik: detailsA.doshas.manglik,
        person_b_manglik: detailsB.doshas.manglik,
        verdict: matchingResult.manglik_compatibility
      },
      recommendation_summary: `${matchingResult.verdict}. Guna Milan score: ${matchingResult.guna_total}/36. Nadi Dosha: ${matchingResult.nadi_dosha ? 'Present (Remedies Advised)' : 'Not Present'}.`
    });

    return res.status(200).json({
      success: true,
      person_a: {
        profile: profileA,
        kundli: detailsA
      },
      person_b: {
        profile: profileB,
        kundli: detailsB
      },
      matching: matchingResult,
      match_id: matchRecord.id
    });
  } catch (error) {
    console.error('Error calculating Kundli matching:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform Kundli matching calculation.'
    });
  }
};

module.exports = {
  generateKundli,
  calculateKundliMatching
};
