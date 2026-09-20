const { MasterService, MasterLanguage } = require('../models');

const SERVICES_DATA = [
  { name: 'Griha Pravesh Puja', code: 'GRIHA_PRAVESH', category: 'Vastu & Home', description: 'Auspicious house warming ceremony to bring positivity, peace, and prosperity.' },
  { name: 'Satyanarayan Katha & Puja', code: 'SATYANARAYAN', category: 'Vrat & Katha', description: 'Divine worship of Lord Vishnu for health, harmony, and removal of obstacles.' },
  { name: 'Rudrabhishek Puja', code: 'RUDRABHISHEK', category: 'Shiva Pujas', description: 'Sacred bathing of Shiva Linga with Vedic mantras to invoke Mahadev\'s blessings.' },
  { name: 'Maha Mrityunjaya Jaap & Havan', code: 'MAHA_MRITYUNJAYA', category: 'Havan & Jaap', description: 'Powerful Vedic mantra chant for health, longevity, and liberation from chronic illness.' },
  { name: 'Vivah Sanskar (Hindu Wedding Ceremony)', code: 'VIVAH_SANSKAR', category: 'Sanskars', description: 'Complete Vedic marriage rituals including Kanyadaan, Saptapadi, and Mangal Pheras.' },
  { name: 'Navgraha Shanti Puja & Havan', code: 'NAVGRAHA_SHANTI', category: 'Graha Dosha', description: 'Harmonize planetary influences and remove negative astrological doshas.' },
  { name: 'Vastu Shanti Puja', code: 'VASTU_SHANTI', category: 'Vastu & Home', description: 'Cleansing and neutralizing negative energies and defects in residential or commercial premises.' },
  { name: 'Mundan Sanskar (Chudakarana)', code: 'MUNDAN_SANSKAR', category: 'Sanskars', description: 'First tonsure ceremony for child\'s purity and intellectual awakening.' },
  { name: 'Namkaran Sanskar (Naming Ceremony)', code: 'NAMKARAN', category: 'Sanskars', description: 'Vedic ritual for naming newborn according to Nakshatra and Janma Rashi.' },
  { name: 'Janeu Sanskar (Upanayana)', code: 'JANEU_UPANAYAN', category: 'Sanskars', description: 'Sacred thread investiture ceremony marking the beginning of Vedic studies.' },
  { name: 'Ganesh Puja & Havan', code: 'GANESH_PUJA', category: 'Devta Pujas', description: 'Invocations to Vighnaharta for auspicious beginnings, businesses, and ventures.' },
  { name: 'Lakshmi Puja & Kuber Havan', code: 'LAKSHMI_KUBER', category: 'Devta Pujas', description: 'Worship for wealth, financial growth, and business prosperity during Diwali & Fridays.' },
  { name: 'Saraswati Puja', code: 'SARASWATI_PUJA', category: 'Devta Pujas', description: 'Ritual invocation for students, artists, and scholars for wisdom and memory.' },
  { name: 'Durga Saptashati Paath & Chandi Havan', code: 'CHANDI_HAVAN', category: 'Devi Pujas', description: 'Powerful Devi recitation and fire ritual for courage, triumph over negativity, and protection.' },
  { name: 'Kaal Sarp Dosh Nivaran Puja', code: 'KAAL_SARP_DOSH', category: 'Graha Dosha', description: 'Specialized Trimbakeshwar or temple ritual to nullify Kaal Sarp Rahu-Ketu yog.' },
  { name: 'Mangal Dosh / Bhat Puja', code: 'MANGAL_DOSH', category: 'Graha Dosha', description: 'Ritual to alleviate Manglik Dosha for marriage harmony.' },
  { name: 'Pitru Dosh & Shraddha / Tarpan Rituals', code: 'PITRU_SHRADDHA', category: 'Pitru Karmas', description: 'Annual Shraddha, Pind Daan, and Mahalaya rituals honoring ancestors.' },
  { name: 'Antyeshti & Antim Sanskar', code: 'ANTYESHTI', category: 'Sanskars', description: 'Solemn 13-day last rites, Garuda Purana paath, and Terahvi ceremonies.' },
  { name: 'Sundarkand Paath & Hanuman Chalisa', code: 'SUNDARKAND_PAATH', category: 'Vedic Paath', description: 'Soulful musical or traditional recitation for mental strength and warding off evil.' },
  { name: 'Bhumi Pujan (Groundbreaking Ceremony)', code: 'BHUMI_PUJAN', category: 'Vastu & Home', description: 'Sacred earth worship before starting construction of home, building, or factory.' },
  { name: 'Office / Shop Opening Puja', code: 'OFFICE_OPENING', category: 'Business & Trade', description: 'Auspicious muhurat puja and Havan for commercial ventures, shops, and offices.' },
  { name: 'Vehicle / Car Puja (Vahan Puja)', code: 'VAHAN_PUJA', category: 'Daily Blessings', description: 'Special invocation for safety, protection, and longevity of new vehicles.' },
  { name: 'Annaprashan Sanskar', code: 'ANNAPRASHAN', category: 'Sanskars', description: 'Baby\'s first solid grain feeding ritual with prayers for health and purity.' },
  { name: 'Kuber Havan', code: 'KUBER_HAVAN', category: 'Havan & Jaap', description: 'Fire offering to Lord Kuber for treasury protection and financial stability.' },
  { name: 'Baglamukhi Anushthan & Havan', code: 'BAGLAMUKHI_HAVAN', category: 'Tantra & Protection', description: 'Specialized ritual for legal victory, court cases, and neutralizing enemies.' }
];

const LANGUAGES_DATA = [
  { name: 'Sanskrit', code: 'SAN', script: 'Devanagari' },
  { name: 'Hindi', code: 'HIN', script: 'Devanagari' },
  { name: 'Gujarati', code: 'GUJ', script: 'Gujarati' },
  { name: 'Marathi', code: 'MAR', script: 'Devanagari' },
  { name: 'Bengali', code: 'BEN', script: 'Bengali' },
  { name: 'Tamil', code: 'TAM', script: 'Tamil' },
  { name: 'Telugu', code: 'TEL', script: 'Telugu' },
  { name: 'Kannada', code: 'KAN', script: 'Kannada' },
  { name: 'Malayalam', code: 'MAL', script: 'Malayalam' },
  { name: 'Odia', code: 'ODI', script: 'Odia' },
  { name: 'Punjabi', code: 'PAN', script: 'Gurmukhi' },
  { name: 'English', code: 'ENG', script: 'Latin' },
  { name: 'Maithili', code: 'MAI', script: 'Devanagari' },
  { name: 'Bhojpuri', code: 'BHO', script: 'Devanagari' },
  { name: 'Marwari', code: 'MWR', script: 'Devanagari' },
  { name: 'Assamese', code: 'ASM', script: 'Bengali-Assamese' }
];

async function seedPanditMasterData() {
  try {
    for (const s of SERVICES_DATA) {
      await MasterService.findOrCreate({
        where: { name: s.name },
        defaults: {
          name: s.name,
          category: s.category,
          description: s.description
        }
      });
    }

    for (const l of LANGUAGES_DATA) {
      await MasterLanguage.findOrCreate({
        where: { name: l.name },
        defaults: {
          name: l.name,
          script: l.script
        }
      });
    }

    console.log('[Seed] Pandit master services and languages seeded successfully.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed pandit master data:', error);
  }
}

module.exports = seedPanditMasterData;

