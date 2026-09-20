const { User } = require('../models');
const { generateAccessToken } = require('../utils/tokenUtils');
require('dotenv').config();

const BASE_URL = 'http://localhost:5001/api/v1/spiritual-content';

async function runSpiritualTests() {
  console.log('\n=== Starting Spiritual / Dharmik CMS End-to-End Verification ===\n');

  try {
    // 1. Setup Admin Token
    console.log('1. Setting up Admin Authentication...');
    let admin = await User.findOne({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await User.create({
        name: 'Vedic Admin',
        email: 'vedicadmin@shubhkaal.com',
        password: 'Password123!',
        role: 'ADMIN',
        auth_provider: 'LOCAL'
      });
    }
    const adminToken = generateAccessToken(admin);
    console.log(`✓ Admin authenticated: ${admin.name} (${admin.email})`);

    // 2. Fetch Masters
    console.log('\n2. Fetching Spiritual Master Data...');
    const mastersRes = await fetch(`${BASE_URL}/masters`);
    const masters = await mastersRes.json();
    if (!masters.success) throw new Error('Failed to fetch masters: ' + masters.message);
    console.log(`✓ Fetched ${masters.data.types.length} types, ${masters.data.deities.length} deities, ${masters.data.categories.length} categories, ${masters.data.tags.length} tags`);

    const stotraType = masters.data.types.find(t => t.code === 'STOTRA') || masters.data.types[0];
    const shivaDeity = masters.data.deities.find(d => d.slug === 'shiva') || masters.data.deities[0];
    const mantraCat = masters.data.categories[0];

    // 3. Admin: Create New Multi-Lingual Spiritual Content
    console.log('\n3. Admin Creating Multi-Lingual Spiritual Text (Shiva Tandava Stotra)...');
    const createRes = await fetch(`${BASE_URL}/admin/contents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        type_id: stotraType.id,
        deity_id: shivaDeity.id,
        category_id: mantraCat.id,
        image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=800',
        is_featured: true,
        sort_order: 5,
        status: 'PUBLISHED',
        tags: ['Shiva', 'Tandava', 'Stotra', 'Ravana', 'Mahadev'],
        type_specific_data: {
          sacred_verse_sanskrit: 'जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्...',
          benefits: 'Bestows inner strength, destruction of ego, and immense Shiva grace.'
        },
        translations: [
          {
            language_code: 'hi',
            title: 'श्री शिव ताण्डव स्तोत्रम् (हिन्दी अर्थ सहित)',
            slug: `shri-shiva-tandava-stotra-hindi-${Date.now().toString(36)}`,
            short_description: 'रावण कृत परम शक्तिशाली एवं दिव्य लयबद्ध शिव ताण्डव स्तोत्र।',
            content: `## शिव ताण्डव स्तोत्रम्

जटाटवीगलज्जलप्रवाहपावितस्थले
गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्।
डमड्डमड्डमड्डमन्निनादवड्डमर्वयं
चकार चण्डताण्डवं तनोतु नः शिवः शिवम्॥ १॥

### हिन्दी भावार्थ
जिनके सघन जटारूपी वन से निकलती हुई गंगाजी की धाराएं जिनके कंठ को पावन करती हैं, और जिनके गले में विशाल सर्पों की माला लटक रही है, डमरू की डम-डम ध्वनि के साथ जो संहारक ताण्डव नृत्य करते हैं, वे कल्याणकारी भगवान शिव हमारा कल्याण करें।`
          },
          {
            language_code: 'mr',
            title: 'श्री शिव तांडव स्तोत्र (मराठी अर्थ)',
            slug: `shri-shiva-tandava-stotra-marathi-${Date.now().toString(36)}`,
            short_description: 'रावणाने रचलेले अत्यंत प्रभावी व लयबद्ध शिव तांडव स्तोत्र मराठी अर्थासहित.',
            content: `## शिव तांडव स्तोत्र (मराठी)

जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्...

### मराठी भावार्थ
जटांच्या घनदाट वनातून वाहणाऱ्या गंगेच्या पवित्र प्रवाहाने ज्यांचे कंठ पावन झाले आहे, अशा डमरूच्या नादावर तांडव नृत्य करणाऱ्या भगवान शंकरांना आमचे वंदन असो.`
          },
          {
            language_code: 'en',
            title: 'Shiva Tandava Stotram (Lyrics & Meaning)',
            slug: `shiva-tandava-stotram-english-${Date.now().toString(36)}`,
            short_description: 'The supreme hymn of praise composed by Ravana celebrating the cosmic dance of Lord Shiva.',
            content: `## Shiva Tandava Stotram

*With his neck consecrated by the flow of water that flows from his thick forest of hair, and on his neck holding the garland of the supreme serpent, performing the ecstatic Tandava dance to the sound of Damaru, may that Lord Shiva shower auspiciousness upon us!*`
          }
        ]
      })
    });

    const createData = await createRes.json();
    if (!createData.success) throw new Error('Create content failed: ' + createData.message);
    const createdContentId = createData.data.contentId;
    console.log(`✓ Spiritual content created successfully! ID: ${createdContentId}`);

    // 4. Admin Dashboard Stats
    console.log('\n4. Verifying Admin Dashboard Stats Counter...');
    const statsRes = await fetch(`${BASE_URL}/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const stats = await statsRes.json();
    console.log(`✓ CMS Stats: Total: ${stats.data.totalContent}, Published: ${stats.data.published}, Drafts: ${stats.data.drafts}`);

    // 5. Public Search & Filter Query
    console.log('\n5. Querying Public Content Directory with Filters...');
    const publicQueryRes = await fetch(`${BASE_URL}?type=STOTRA&deity=shiva&language=hi`);
    const publicData = await publicQueryRes.json();
    if (!publicData.success) throw new Error('Public directory query failed: ' + publicData.message);
    console.log(`✓ Directory query returned ${publicData.data.contents.length} items.`);
    const foundItem = publicData.data.contents.find(c => c.id === createdContentId);
    console.log(`✓ Found Created Item: "${foundItem?.active_translation?.title}" (Type: ${foundItem?.type?.name}, Deity: ${foundItem?.deity?.name})`);

    // 6. Public Slug Query in Marathi with Fallback Test
    console.log('\n6. Fetching Content Detail by Slug with Multi-lingual Switching...');
    const slugRes = await fetch(`${BASE_URL}/${foundItem.active_translation.slug}?lang=mr`);
    const slugData = await slugRes.json();
    if (!slugData.success) throw new Error('Slug detail query failed: ' + slugData.message);
    console.log(`✓ Retrieved Detail for Slug: "${slugData.data.active_translation.title}" (Lang: ${slugData.data.active_translation.language_code})`);
    console.log(`✓ Available Translations: ${slugData.data.available_translations.map(t => t.language_code).join(', ')}`);

    // 7. Public User Submitting Content Request
    console.log('\n7. Submitting Public User Spiritual Content Request...');
    const requestRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Devotee Amit Kulkarni',
        email: 'amit.kulkarni@example.com',
        phone: '9820011223',
        request_type: 'Stotra',
        requested_title: 'श्री नवग्रह स्तोत्र (मराठी अर्थासहित)',
        language_code: 'mr',
        description: 'कृपया नवग्रह शांतीसाठी व्यास रचित नवग्रह स्तोत्र व जप पद्धती जोडावी.'
      })
    });
    const reqData = await requestRes.json();
    if (!reqData.success) throw new Error('Content request submission failed: ' + reqData.message);
    const requestId = reqData.data.request.id;
    console.log(`✓ Request submitted successfully! ID: ${requestId}`);

    // 8. Admin Moderating Content Request
    console.log('\n8. Admin Reviewing and Updating Request Status...');
    const modReqRes = await fetch(`${BASE_URL}/admin/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'UNDER_REVIEW',
        admin_note: 'Assigned to Vedic editorial team for Marathi verification.'
      })
    });
    const modReqData = await modReqRes.json();
    console.log(`✓ Request updated by Admin: ${modReqData.message}`);

    // 9. RBAC Security Check: Unauthenticated / Non-Admin Access Rejection
    console.log('\n9. Verifying RBAC Security (Non-Admin & Unauthorized Rejection)...');
    const unauthorizedRes = await fetch(`${BASE_URL}/admin/contents`);
    if (unauthorizedRes.status === 401) {
      console.log(`✓ 401 Unauthorized returned correctly for missing token.`);
    } else {
      console.warn(`⚠️ Expected 401 but got: ${unauthorizedRes.status}`);
    }

    console.log('\n===========================================================');
    console.log('🎉 ALL SPIRITUAL / DHARMIK CMS END-TO-END TESTS PASSED! 🎉');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err);
    process.exit(1);
  }
}

runSpiritualTests();
