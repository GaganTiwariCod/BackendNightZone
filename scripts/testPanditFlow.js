const { User, PanditProfile } = require('../models');
const { generateAccessToken } = require('../utils/tokenUtils');

const API_BASE = 'http://localhost:5001/api/v1';

async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || `HTTP ${res.status}`);
    error.data = json;
    throw error;
  }
  return json;
}

async function runTests() {
  console.log('=== Starting Pandit Module End-to-End Verification ===\n');

  // 1. Get or create test admin user
  console.log('1. Setting up Test Admin User...');
  const [user] = await User.findOrCreate({
    where: { email: 'gaganstiwari@gmail.com' },
    defaults: {
      name: 'Gagan Tiwari',
      email: 'gaganstiwari@gmail.com',
      password: 'Password123!',
      role: 'ADMIN',
      is_active: true
    }
  });

  if (user.role !== 'ADMIN') {
    await user.update({ role: 'ADMIN' });
  }

  const token = generateAccessToken(user);
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log(`✓ Admin user confirmed: ${user.name} (${user.role}). JWT token generated.`);

  // 2. Fetch Master Data
  console.log('\n2. Fetching Master Services & Languages...');
  const masterRes = await req(`${API_BASE}/pandits/master-data`);
  const { services, languages, vedas } = masterRes.data;
  console.log(`✓ Fetched ${services.length} master services, ${languages.length} languages, and ${vedas.length} vedas.`);

  if (services.length === 0 || languages.length === 0) {
    throw new Error('Master data is empty!');
  }

  // 3. Save Basic Information
  console.log('\n3. Saving Step 1: Basic Information...');
  const basicRes = await req(`${API_BASE}/pandits/basic`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Acharya',
      full_name: 'Vidyadhar Ramchandra Shastri',
      display_name: 'Acharya Vidyadhar Shastri',
      gender: 'male',
      primary_phone: '9820098200',
      whatsapp_number: '9820098200',
      email: 'vidyadhar.shastri@shubhkaal.com',
      years_of_experience: 18,
      pandit_types: ['Vedic Ritualist (Karma Kanda)', 'Jyotish / Astrologer', 'Havankari / Yajna Specialist'],
      short_bio: 'Senior Rigveda & Shukla Yajurveda Shastri specializing in Griha Pravesh, Vivah, and Maha Mrityunjaya Havans.',
      about: 'Inherited sacred Vedic traditions from traditional family lineage of Varanasi and completed Acharya from Sampurnanand Sanskrit Vishwavidyalaya.'
    })
  });

  const profile = basicRes.data.profile;
  console.log(`✓ Basic info saved! Generated Slug: ${profile.slug}`);

  // 4. Save Religious Details
  console.log('\n4. Saving Step 2: Religious & Vedic Lineage...');
  await req(`${API_BASE}/pandits/religious`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      gotra: 'Shandilya',
      pravara: 'Shandilya, Asita, Devala (Tryarsheya)',
      veda: 'Rigveda',
      shakha: 'Shakala',
      sutra: 'Ashvalayana',
      sampradaya: 'Smartha',
      kul_devta: 'Lord Shiva (Mahadev)',
      ishta_devta: 'Maha Lakshmi',
      guru_parampara: 'Shri Kashi Vidwat Parishad Lineage'
    })
  });
  console.log('✓ Religious details saved!');

  // 5. Save Services
  console.log('\n5. Saving Step 3: Puja Services...');
  const chosenServices = services.slice(0, 4).map((s, idx) => ({
    service_id: s.id,
    is_primary: idx === 0,
    years_experience: 18,
    price_type: idx === 0 ? 'fixed' : 'dakshina_only',
    fixed_price: idx === 0 ? 5100 : null,
    duration_minutes: 90,
    includes_samagri: true
  }));

  await req(`${API_BASE}/pandits/services`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ services: chosenServices })
  });
  console.log(`✓ ${chosenServices.length} Puja services assigned!`);

  // 6. Save Languages
  console.log('\n6. Saving Step 4: Languages...');
  const chosenLanguages = languages.slice(0, 3).map((l, idx) => ({
    language_id: l.id,
    fluency: idx === 0 ? 'native' : 'fluent',
    can_recite_mantras: true,
    is_primary: idx === 0
  }));

  await req(`${API_BASE}/pandits/languages`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ languages: chosenLanguages })
  });
  console.log(`✓ ${chosenLanguages.length} Languages assigned!`);

  // 7. Save Education
  console.log('\n7. Saving Step 5: Vedic Education...');
  await req(`${API_BASE}/pandits/education`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      education: [
        {
          institution_name: 'Sampurnanand Sanskrit Vishwavidyalaya, Varanasi',
          institution_type: 'sanskrit_university',
          degree_or_title: 'Acharya (Veda & Karma Kanda)',
          field_of_study: 'Rigveda Samhita & Shrauta Sutras',
          board_or_university: 'Sanskrit University Varanasi',
          year_of_passing: 2008,
          honors: 'First Class with Gold Medal'
        }
      ]
    })
  });
  console.log('✓ Education records saved!');

  // 8. Save Experience
  console.log('\n8. Saving Step 6: Temple / Sansthan Experience...');
  await req(`${API_BASE}/pandits/experience`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      experience: [
        {
          organization_or_temple_name: 'Kashi Vishwanath Sansthan & Traditional Mandal',
          role_title: 'Senior Vedic Purohit',
          temple_type: 'temple',
          city: 'Varanasi',
          state: 'Uttar Pradesh',
          country: 'India',
          start_year: 2008,
          end_year: 2018,
          is_current: false,
          key_rituals_handled: 'Rudrabhishek, Nav Chandi Yajna, Vivah Sanskar'
        },
        {
          organization_or_temple_name: 'Shree Siddhivinayak Seva Mandal',
          role_title: 'Chief Karma Kandi Acharya',
          temple_type: 'vedic_sansthan',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          start_year: 2018,
          is_current: true,
          key_rituals_handled: 'Griha Pravesh, Vastu Shanti, Maha Yajna'
        }
      ]
    })
  });
  console.log('✓ Experience records saved!');

  // 9. Save Locations & Travel
  console.log('\n9. Saving Step 7: Locations & Travel Radius...');
  await req(`${API_BASE}/pandits/locations`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      residential: {
        current_address: 'Flat 402, Shiv Shakti Dham, Dadar West',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postal_code: '400028',
        travel_available: true,
        max_travel_distance_km: 75,
        outstation_available: true,
        international_travel: true,
        travel_expenses_extra: true
      },
      service_locations: [
        { city: 'Mumbai', state: 'Maharashtra', country: 'India', areas_covered: ['Dadar', 'Bandra', 'Andheri', 'Thane'], is_primary: true },
        { city: 'Pune', state: 'Maharashtra', country: 'India', areas_covered: ['Kothrud', 'Baner', 'Shivaji Nagar'], is_primary: false }
      ]
    })
  });
  console.log('✓ Locations & travel settings saved!');

  // 10. Save Availability
  console.log('\n10. Saving Step 8: Availability...');
  await req(`${API_BASE}/pandits/availability`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      morning_slot: true,
      afternoon_slot: true,
      evening_slot: true,
      allows_home_visit: true,
      allows_temple_service: true,
      allows_online_puja: true,
      advance_booking_days: 2,
      consultation_available: true,
      notes: 'Please book at least 2 days in advance for auspicious Muhurat calculation.'
    })
  });
  console.log('✓ Availability schedule saved!');

  // 11. Submit for Verification
  console.log('\n11. Submitting Profile for Verification (Step 10)...');
  const submitRes = await req(`${API_BASE}/pandits/submit`, {
    method: 'POST',
    headers: authHeaders
  });
  console.log(`✓ Profile submitted! Current Status: ${submitRes.data.profile.status}`);

  // 12. Admin Moderation: Approve and Publish
  console.log('\n12. Moderating Profile as Admin: Approving and Publishing...');
  const adminRes = await req(`${API_BASE}/pandits/admin/pandits/${profile.id}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'published',
      admin_notes: 'Verified credentials and certificates with Varanasi Sanskrit Parishad. Approved.',
      badges: {
        identity_verified: true,
        education_verified: true,
        experience_verified: true,
        vedic_certified: true,
        top_rated_pandit: true
      }
    })
  });
  console.log(`✓ Admin approved! Status: ${adminRes.data.profile.status}`);

  // 13. Public Directory Search
  console.log('\n13. Querying Public Directory for Published Pandits...');
  const dirRes = await req(`${API_BASE}/pandits/public/directory?city=Mumbai&verified_only=true`);
  console.log(`✓ Found ${dirRes.data.pandits.length} published verified pandits in directory.`);
  const foundPandit = dirRes.data.pandits.find(p => p.slug === profile.slug);
  if (!foundPandit) {
    throw new Error('Newly published pandit not found in directory search!');
  }
  console.log(`✓ Found: ${foundPandit.title} ${foundPandit.full_name} (${foundPandit.city})`);

  // 14. Public Profile Detail & Privacy Check
  console.log(`\n14. Fetching Public Profile by Slug: /api/v1/pandits/public/${profile.slug}...`);
  const publicRes = await req(`${API_BASE}/pandits/public/${profile.slug}`);
  const pubData = publicRes.data.profile;

  console.log('✓ Public profile retrieved successfully!');
  console.log(`  Name: ${pubData.title} ${pubData.full_name}`);
  console.log(`  Veda: ${pubData.religiousDetail?.veda}`);
  console.log(`  Services Count: ${pubData.services?.length}`);
  console.log(`  Languages Count: ${pubData.languages?.length}`);

  // Verification that private data is not leaked
  if (pubData.current_address || pubData.documents) {
    throw new Error('Privacy check failed: Private KYC documents or street address leaked in public API!');
  }
  console.log('✓ Strict privacy validation passed: Private KYC documents & residential addresses are safely guarded.');

  console.log('\n======================================================');
  console.log('🎉 ALL PANDIT MODULE END-TO-END TESTS PASSED CLEANLY! 🎉');
  console.log('======================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ Verification Failed:', err.data || err.message);
  process.exit(1);
});
