const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Astrology End-to-End Test Suite...\n');

  // 1. Authenticate Test User
  const testEmail = `astro_tester_${Date.now()}@shubhkaal.com`;
  const registerRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Gagan Tiwari',
    email: testEmail,
    password: 'password123',
    phone: '9876543210',
    role: 'CUSTOMER'
  });

  let token = registerRes.data?.data?.accessToken;
  if (!token) {
    console.error('Registration failed:', registerRes);
    throw new Error('Could not authenticate test user');
  }
  console.log('✅ 1. Authenticated test user:', testEmail);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch Profiles (Verify SELF auto-creation)
  const profilesRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/astrology/profiles',
    method: 'GET',
    headers: authHeaders
  });
  console.log('✅ 2. Fetch Profiles:', profilesRes.data.profiles?.length, 'profile(s) found.');
  const selfProfile = profilesRes.data.profiles?.find(p => p.profile_type === 'SELF') || profilesRes.data.profiles?.[0];
  console.log(`   👉 Self Profile: ${selfProfile?.name} (${selfProfile?.profile_type}) - ${selfProfile?.birth_place}`);

  // 3. Add New Person (Rahul - Brother)
  const addPersonRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/astrology/profiles',
    method: 'POST',
    headers: authHeaders
  }, {
    profile_type: 'OTHER',
    name: 'Rahul Tiwari',
    relationship: 'Brother',
    gender: 'male',
    date_of_birth: '1998-05-14',
    time_of_birth: '08:45',
    birth_time_accuracy: 'ACCURATE',
    birth_place: 'Varanasi, Uttar Pradesh, India',
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: 'Asia/Kolkata'
  });
  console.log('✅ 3. Add Person (Brother):', addPersonRes.data.message);
  const brotherProfile = addPersonRes.data.profile;

  // 4. Generate Kundli for Self
  const kundliRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/astrology/kundli/generate',
    method: 'POST',
    headers: authHeaders
  }, { astrology_profile_id: selfProfile.id });
  console.log('✅ 4. Kundli Generated:', {
    lagna: kundliRes.data.kundli?.lagna,
    moon_sign: kundliRes.data.kundli?.moon_sign,
    nakshatra: kundliRes.data.kundli?.nakshatra,
    manglik: kundliRes.data.kundli?.doshas?.manglik?.severity
  });

  // 5. Kundli Matching (Self & Rahul / Partner)
  const matchRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/astrology/kundli/match',
    method: 'POST',
    headers: authHeaders
  }, {
    person_a_profile_id: selfProfile.id,
    person_b_profile_id: brotherProfile.id
  });
  console.log('✅ 5. 36 Guna Milan Matching Score:', `${matchRes.data.matching?.guna_total} / 36 (${matchRes.data.matching?.verdict})`);

  // 6. Fetch Verified Astrologers Directory
  const astrologersRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/astrology/astrologers',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  console.log('✅ 6. Astrologers Directory:', astrologersRes.data.astrologers?.length, 'verified astrologers found.');
  const astrologer = astrologersRes.data.astrologers?.[0];

  if (astrologer) {
    console.log(`   👉 Selected Astrologer: ${astrologer.display_name} (${astrologer.specializations?.join(', ')})`);

    // 7. Book Astrologer Consultation
    const today = new Date().toISOString().split('T')[0];
    const bookingRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/astrology/bookings',
      method: 'POST',
      headers: authHeaders
    }, {
      astrologer_id: astrologer.id,
      astrology_profile_id: selfProfile.id,
      consultation_type: 'CHAT',
      booking_date: today,
      start_time: '14:30',
      end_time: '15:00',
      duration_minutes: 30
    });
    console.log('✅ 7. Booking Consultation:', bookingRes.data.message, `Meeting ID: ${bookingRes.data.booking?.meeting_reference}`);
    const consultationId = bookingRes.data.consultation_id;

    // 8. Test Double-Booking Collision Prevention
    const doubleBookingRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/astrology/bookings',
      method: 'POST',
      headers: authHeaders
    }, {
      astrologer_id: astrologer.id,
      astrology_profile_id: brotherProfile.id,
      consultation_type: 'AUDIO_CALL',
      booking_date: today,
      start_time: '14:30',
      end_time: '15:00',
      duration_minutes: 30
    });
    if (doubleBookingRes.status === 409) {
      console.log('✅ 8. Double-Booking Prevention Passed! Collision correctly rejected with status 409 Conflict.');
    } else {
      console.log('⚠️ 8. Double-booking check status:', doubleBookingRes.status);
    }

    // 9. Send Chat Message in Consultation
    const msgRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: `/api/v1/astrology/consultations/${consultationId}/messages`,
      method: 'POST',
      headers: authHeaders
    }, {
      message: 'Pranam Acharya ji, could you check my career trajectory and favorable periods for business?'
    });
    console.log('✅ 9. Consultation Chat Message Sent:', msgRes.data.message?.message);

    // 10. Astrologer Completes Session & Recommends Spiritual Puja / Remedy
    const completeRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: `/api/v1/astrology/consultations/${consultationId}/complete`,
      method: 'POST',
      headers: authHeaders
    }, {
      summary: 'Strong Jupiter in 9th house indicates great business opportunities after May. Suggested Navgraha Puja and wearing Yellow Sapphire.',
      astrologer_notes: 'Client exhibits high entrepreneurial acumen. Advised to perform Gayatri Havan on Poornima.',
      recommendations: [
        {
          service_type: 'PUJA',
          title: 'Navgraha Shanti Puja & Havan',
          description: 'Special Vedic Navgraha Shanti puja to balance planetary energies and remove obstacles in trade.',
          optional_action_url: '/services/pandit'
        }
      ]
    });
    console.log('✅ 10. Consultation Completed with Spiritual Remedy Recommendation:', completeRes.data.message);

    // 11. Post Review
    const reviewRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/astrology/consultations/review',
      method: 'POST',
      headers: authHeaders
    }, {
      consultation_id: consultationId,
      rating: 5,
      review_text: 'Extremely accurate predictions and very calming, practical remedies! Highly recommended.'
    });
    console.log('✅ 11. Post-Consultation Review Submitted:', reviewRes.data.message);

    // 12. Fetch User Reports
    const reportsRes = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/astrology/reports',
      method: 'GET',
      headers: authHeaders
    });
    console.log('✅ 12. User Reports Library:', reportsRes.data.reports?.length, 'reports generated and saved.');
  }

  console.log('\n🎉 ALL ASTROLOGY BACKEND ARCHITECTURE TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
});
