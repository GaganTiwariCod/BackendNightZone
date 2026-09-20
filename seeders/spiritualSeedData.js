const {
  SpiritualContentType,
  SpiritualDeity,
  SpiritualCategory,
  SpiritualTag,
  SpiritualContent,
  SpiritualContentTranslation,
  SpiritualContentTag,
  sequelize
} = require('../models');

const seedSpiritualData = async () => {
  try {
    // 1. Content Types
    const types = [
      { code: 'POOJA', name: 'Pooja', icon: '🪔', description: 'Vedic rituals, samagri and step-by-step procedures' },
      { code: 'KATHA', name: 'Katha', icon: '📜', description: 'Sacred mythological stories, vrat kathas and puranic narratives' },
      { code: 'MANTRA', name: 'Mantra', icon: '🕉️', description: 'Vedic chants, beej mantras and stotras with meaning and chanting rules' },
      { code: 'AARTI', name: 'Aarti', icon: '🔔', description: 'Traditional devotional aartis with lyrics and significance' },
      { code: 'STOTRA', name: 'Stotra', icon: '✨', description: 'Hymns of praise celebrating deities with meter and meter benefits' },
      { code: 'CHALISA', name: 'Chalisa', icon: '📖', description: 'Forty-verse devotional hymns dedicated to deities' },
      { code: 'VRAT', name: 'Vrat', icon: '🌙', description: 'Fast rules, mahatmya, tithi timings and parana vidhi' },
      { code: 'FESTIVAL', name: 'Festival', icon: '🎉', description: 'Hindu festivals, auspicious dates, significance and celebration guide' },
      { code: 'BHAJAN', name: 'Bhajan', icon: '🎵', description: 'Devotional songs, kirtans and pads with lyrics' },
      { code: 'STORY', name: 'Spiritual Story', icon: '📚', description: 'Moral, ethical and inspiring tales from Itihasa and Puranas' },
      { code: 'POOJA_VIDHI', name: 'Pooja Vidhi', icon: '🌺', description: 'Detailed ceremonial guides for home and temple rituals' },
      { code: 'OTHER', name: 'Other Dharmik', icon: '🕊️', description: 'General Dharmik articles, spiritual philosophy and traditions' }
    ];

    const typeMap = {};
    for (const t of types) {
      const [rec] = await SpiritualContentType.findOrCreate({
        where: { code: t.code },
        defaults: t
      });
      typeMap[t.code] = rec.id;
    }

    // 2. Deities
    const deities = [
      { name: 'Lord Shiva', slug: 'shiva', description: 'Mahadev, Bholenath, Lord of Destruction and Transformation', image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lord Hanuman', slug: 'hanuman', description: 'Bajrangbali, Sankat Mochan, Supreme symbol of strength and devotion', image_url: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lord Ganesh', slug: 'ganesh', description: 'Vighnaharta, Ganpati Bappa, Lord of New Beginnings and Wisdom', image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lord Krishna', slug: 'krishna', description: 'Govinda, Vasudeva, Supreme Lord and speaker of Bhagavad Gita', image_url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lord Ram', slug: 'ram', description: 'Maryada Purushottam, Lord of Ayodhya and upholder of Dharma', image_url: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&auto=format&fit=crop&q=80' },
      { name: 'Goddess Durga', slug: 'durga', description: 'Maa Sherawali, Mother of Universe, slayer of Mahishasura', image_url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&auto=format&fit=crop&q=80' },
      { name: 'Goddess Lakshmi', slug: 'lakshmi', description: 'Goddess of Wealth, Prosperity, Fortune and auspiciousness', image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lord Vishnu', slug: 'vishnu', description: 'Narayana, Preserver of Universe and protector of all beings', image_url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=600&auto=format&fit=crop&q=80' },
      { name: 'Goddess Saraswati', slug: 'saraswati', description: 'Goddess of Knowledge, Music, Art, Speech and Learning', image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lord Surya', slug: 'surya', description: 'Sun God, Pratyaksha Daivam, source of light, energy and vitality', image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=600&auto=format&fit=crop&q=80' }
    ];

    const deityMap = {};
    for (const d of deities) {
      const [rec] = await SpiritualDeity.findOrCreate({
        where: { slug: d.slug },
        defaults: d
      });
      deityMap[d.slug] = rec.id;
    }

    // 3. Categories
    const categories = [
      { name: 'Daily Devotion & Aarti', slug: 'daily-devotion-aarti', description: 'Regular morning and evening household pujas and aartis' },
      { name: 'Vrat & Fasting Kathas', slug: 'vrat-fasting-kathas', description: 'Traditional fast stories and ritual observance guidelines' },
      { name: 'Chants, Mantras & Stotras', slug: 'chants-mantras-stotras', description: 'Vedic mantras with spiritual vibrations, benefits and procedures' },
      { name: 'Chalisa & Kavach', slug: 'chalisa-kavach', description: '40-couplet prayers and spiritual protective shields' },
      { name: 'Ceremonies & Pooja Vidhi', slug: 'ceremonies-pooja-vidhi', description: 'Step-by-step samagri list and ritual procedures for festive occasions' },
      { name: 'Puranic & Moral Stories', slug: 'puranic-moral-stories', description: 'Wisdom stories from Ramayana, Mahabharata and Shiva Purana' }
    ];

    const categoryMap = {};
    for (const c of categories) {
      const [rec] = await SpiritualCategory.findOrCreate({
        where: { slug: c.slug },
        defaults: c
      });
      categoryMap[c.slug] = rec.id;
    }

    // 4. Tags
    const tagNames = [
      'Hanuman', 'Bajrangbali', 'Tuesday', 'Chalisa', 'Sankat Mochan',
      'Shiva', 'Mahadev', 'Somwar', 'Mantra', 'Aarti', 'Maha Mrityunjaya',
      'Ganesh', 'Vighnaharta', 'Sukhkarta', 'Satyanarayan', 'Vrat',
      'Durga', 'Navratri', 'Lakshmi', 'Diwali', 'Gayatri', 'Surya'
    ];

    const tagMap = {};
    for (const tn of tagNames) {
      const slug = tn.toLowerCase().replace(/\s+/g, '-');
      const [rec] = await SpiritualTag.findOrCreate({
        where: { slug },
        defaults: { name: tn, slug }
      });
      tagMap[slug] = rec.id;
    }

    // 5. Seed Core Dharmik Contents with Multi-language Translations (Hindi, Marathi, English)
    const contentsToSeed = [
      // 1. Hanuman Chalisa
      {
        typeCode: 'CHALISA',
        deitySlug: 'hanuman',
        categorySlug: 'chalisa-kavach',
        is_featured: true,
        sort_order: 1,
        status: 'PUBLISHED',
        image_url: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&auto=format&fit=crop&q=80',
        tags: ['hanuman', 'bajrangbali', 'tuesday', 'chalisa', 'sankat-mochan'],
        type_specific_data: {
          sacred_verses_count: 43,
          best_time_to_chant: 'Tuesday & Saturday mornings or evenings',
          recommended_repetitions: '1, 7, or 11 times daily',
          benefits: 'Dispels negative energies, instills courage, mental peace, and overcomes life obstacles.'
        },
        translations: [
          {
            language_code: 'hi',
            title: 'श्री हनुमान चालीसा (सम्पूर्ण अर्थ एवं पाठ)',
            slug: 'shri-hanuman-chalisa-hindi',
            short_description: 'गोस्वामी तुलसीदास कृत श्री हनुमान चालीसा सम्पूर्ण दोहा एवं चौपाई सहित, नित्य पाठ हेतु।',
            meta_title: 'श्री हनुमान चालीसा - हिन्दी पाठ एवं अर्थ | Shubhkaal',
            meta_description: 'नित्य पाठ हेतु श्री हनुमान चालीसा, दोहा, चौपाई एवं संपूर्ण अर्थ। भय निवारक एवं शक्ति प्रदायक।',
            content: `## दोहा
श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।
बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥

बुद्धिहीन तनु जानिके सुमिरौ पवन-कुमार।
बल बुधि बिद्या देहु मोहिं हरहु कलेस बिकार॥

---

## चौपाई

जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥ १॥
राम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥ २॥

महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥ ३॥
कंचन बरन बिराज सुबेसा। कानन कुंडल कुंचित केसा॥ ४॥

हाथ बज्र औ ध्वजा बिराजै। काँधे मूँज जनेऊ साजै॥ ५॥
संकर सुवन केसरीनंदन। तेज प्रताप महा जग बंदन॥ ६॥

बिद्यावान गुनी अति चातुर। राम काज करिबे को आतुर॥ ७॥
प्रभु चरित्र सुनिबे को रसिया। राम लखन सीता मन बसिया॥ ८॥

सूक्ष्म रूप धरि सियहिं दिखावा। बिकट रूप धरि लंक जरावा॥ ९॥
भीम रूप धरि असुर सँहारे। रामचंद्र के काज सँवारे॥ १०॥

लाय सजीवन लखन जियाये। श्रीरघुबीर हरषि उर लाये॥ ११॥
रघुपति कीन्ही बहुत बड़ाई। तुम्ह मम प्रिय भरतहि सम भाई॥ १२॥

सहस बदन तुम्हरो जस गावैं। अस कहि श्रीपति कंठ लगावैं॥ १३॥
सनकादिक ब्रह्मादि मुनीसा। नारद सारद सहित अहीसा॥ १४॥

जम कुबेर दिगपाल जहाँ ते। कबि कोबिद कहि सके कहाँ ते॥ १५॥
तुम उपकार सुग्रीवहिं कीन्हा। राम मिलाय राज पद दीन्हा॥ १६॥

तुम्हरो मंत्र बिभीषन माना। लंकेस्वर भए सब जग जाना॥ १७॥
जुग सहस्र जोजन पर भानू। लील्यो ताहि मधुर फल जानू॥ १८॥

प्रभु मुद्रिका मेलि मुख माहीं। जलधि लाँघि गये अचरज नाहीं॥ १९॥
दुर्गम काज जगत के जेते। सुगम अनुग्रह तुम्हरे तेते॥ २०॥

राम दुआरे तुम रखवारे। होत न आज्ञा बिनु पैसारे॥ २१॥
सब सुख लहै तुम्हारी सरना। तुम रक्षक काहू को डर ना॥ २२॥

आपन तेज सम्हारो आपै। तीनों लोक हाँक तें काँपै॥ २३॥
भूत पिसाच निकट नहिं आवै। महाबीर जब नाम सुनावै॥ २४॥

नासै रोग हरै सब पीरा। जपत निरंतर हनुमत बीरा॥ २५॥
संकट तें हनुमान छुड़ावै। मन क्रम बचन ध्यान जो लावै॥ २६॥

सब पर राम तपस्वी राजा। तिन के काज सकल तुम साजा॥ २७॥
और मनोरथ जो कोई लावै। सोइ अमित जीवन फल पावै॥ २८॥

चारों जुग परताप तुम्हारा। है परसिद्ध जगत उजियारा॥ २९॥
साधु संत के तुम रखवारे। असुर निकंदन राम दुलारे॥ ३०॥

अष्ट सिद्धि नौ निधि के दाता। अस बर दीन जानकी माता॥ ३१॥
राम रसायन तुम्हरे पासा। सदा रहो रघुपति के दासा॥ ३२॥

तुम्हरे भजन राम को पावै। जनम जनम के दुख बिसरावै॥ ३३॥
अंत काल रघुबर पुर जाई। जहाँ जन्म हरि-भक्त कहाई॥ ३४॥

और देवता चित्त न धरई। हनुमत सेइ सर्ब सुख करई॥ ३५॥
संकट कटै मिटै सब पीरा। जो सुमिरै हनुमत बलबीरा॥ ३६॥

जै जै जै हनुमान गोसाईं। कृपा करहु गुरुदेव की नाईं॥ ३७॥
जो सत बार पाठ कर कोई। छूटहि बंदि महा सुख होई॥ ३८॥

जो यह पढ़ै हनुमान चालीसा। होय सिद्धि साखी गौरीसा॥ ३९॥
तुलसीदास सदा हरि चेरा। कीजै नाथ हृदय मँह डेरा॥ ४०॥

---

## दोहा
पवनतनय संकट हरन मंगल मूरति रूप।
राम लखन सीता सहित हृदय बसहु सुर भूप॥`
          },
          {
            language_code: 'mr',
            title: 'श्री हनुमान चालीसा (मराठी भावार्थ व नित्य पठण)',
            slug: 'shri-hanuman-chalisa-marathi',
            short_description: 'गोस्वामी तुलसीदास विरचित संपूर्ण श्री हनुमान चालीसा, मराठी अर्थ व नित्य पारायणासाठी उपयुक्त.',
            meta_title: 'श्री हनुमान चालीसा मराठी - पाठ व भावार्थ | Shubhkaal',
            meta_description: 'श्री हनुमान चालीसा संपूर्ण दोहा व चौपाई मराठी भाषांतरासह. संकट निवारण आणि आत्मबळ वाढवण्यासाठी नित्य पठण करा.',
            content: `## दोहा
श्रीगुरुंच्या चरणकमलांच्या रजाने मनाचा आरसा शुद्ध करून, मी श्रीरामांच्या निर्मळ यशाचे वर्णन करतो, जे धर्म, अर्थ, काम आणि मोक्ष हे चारही फळ देणारे आहे.

स्वतःला बुद्धिहीन जाणून मी पवनपुत्र हनुमानांचे स्मरण करतो. मला बल, बुद्धी आणि विद्या द्या व माझ्या सर्व दुःखांचा व विकारांचा नाश करा.

---

## चौपाई व भावार्थ

**१. जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥**
हे हनुमंता, तुमचा जयजयकार असो! तुम्ही ज्ञान आणि सद्गुणांचे सागर आहात. तिन्ही लोकांत तुमची कीर्ती प्रकाशमान आहे.

**२. राम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥**
तुम्ही प्रभू श्रीरामांचे दूत आणि अतुलनीय शक्तीचे भांडार आहात. तुम्ही माता अंजनीचे सुपुत्र आणि पवनपुत्र म्हणून ओळखले जाता.

**३. महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥**
तुम्ही महापराक्रमी आणि वज्रासारखे बलवान आहात. वाईट बुद्धीचा नाश करून तुम्ही सत्बुद्धीची संगत देणारे आहात.

**४. भूत पिसाच निकट नहिं आवै। महाबीर जब नाम सुनावै॥**
महावीर हनुमानाचे नाव घेताच भूत-पिशाच, नकारात्मक ऊर्जा जवळही फिरकू शकत नाहीत.

**५. नासै रोग हरै सब पीरा। जपत निरंतर हनुमत बीरा॥**
वीर हनुमानाचे निरंतर नामस्मरण केल्याने सर्व रोग, व्याधी व वेदना नष्ट होतात.

**६. संकट तें हनुमान छुड़ावै। मन क्रम बचन ध्यान जो लावै॥**
जे लोक मन, कर्म आणि वचनाने हनुमानाचे ध्यान करतात, त्यांना हनुमानजी सर्व संकटांतून सोडवतात.

**७. जो यह पढ़ै हनुमान चालीसा। होय सिद्धि साखी गौरीसा॥**
जो कोणी या हनुमान चालीसेचे मनोभावे पठण करतो, त्याला सिद्धी प्राप्त होते, याची साक्ष साक्षात भगवान शंकर देतात.

---

## दोहा
हे पवनपुत्र, संकटांचे हरण करणारे आणि मंगलमूर्ती स्वरूप असलेल्या हनुमंता, तुम्ही प्रभू श्रीराम, लक्ष्मण आणि माता सीतेसह माझ्या हृदयात सदैव वास करा!`
          },
          {
            language_code: 'en',
            title: 'Shri Hanuman Chalisa (Sacred Hymn with English Meaning)',
            slug: 'shri-hanuman-chalisa-english',
            short_description: 'Complete 40-verse hymn composed by Goswami Tulsidas praising Lord Hanuman with English translation and chanting guide.',
            meta_title: 'Shri Hanuman Chalisa - Complete English Translation & Verses | Shubhkaal',
            meta_description: 'Read the complete Shri Hanuman Chalisa with English verse-by-verse translation, spiritual meaning, and daily benefits.',
            content: `## Opening Doha
*Cleansing the mirror of my mind with the dust of the holy lotus feet of the Guru, I narrate the pure glory of Lord Raghuvara (Rama), which bestows the four fruits of life (Dharma, Artha, Kama, Moksha).*

*Knowing myself to be devoid of wisdom, I meditate on you, O Son of Wind (Pavana-putra)! Grant me strength, intellect, and pure knowledge, and remove all my afflictions and impurities.*

---

## Key Verses & Meaning

**Verse 1:**
*Jai Hanuman Gyan Gun Sagar, Jai Kapis Tihun Lok Ujagar.*
Victory to you, O Lord Hanuman, the boundless ocean of wisdom and virtues! Victory to the lord of monkeys whose radiance enlightens all three worlds!

**Verse 2:**
*Ram Doot Atulit Bal Dhama, Anjani Putra Pavansut Nama.*
You are Lord Rama's revered messenger, the reservoir of incomparable power, known as the radiant son of Anjana and the Pavansuta.

**Verse 24:**
*Bhoot Pisach Nikat Nahin Aavai, Mahabir Jab Naam Sunavai.*
No evil spirits, ghosts, or dark energies dare approach wherever the name of the mighty Mahavira Hanuman is invoked.

**Verse 25:**
*Nase Rog Hare Sab Peera, Japat Nirantar Hanumat Beera.*
All diseases, illnesses, and severe agony are dissolved when one incessantly chants the sacred name of the brave Lord Hanuman.

**Verse 36:**
*Sankat Kate Mite Sab Peera, Jo Sumire Hanumat Balbeera.*
All difficulties vanish and all pain ceases for those who lovingly contemplate Lord Hanuman.

---

## Concluding Doha
*O Son of the Wind, destroyer of perils, the embodiment of supreme auspiciousness! Reside eternally in my heart along with Lord Rama, Lakshmana, and Mother Sita.*`
          }
        ]
      },

      // 2. Shri Ganesh Aarti
      {
        typeCode: 'AARTI',
        deitySlug: 'ganesh',
        categorySlug: 'daily-devotion-aarti',
        is_featured: true,
        sort_order: 2,
        status: 'PUBLISHED',
        image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=800&auto=format&fit=crop&q=80',
        tags: ['ganesh', 'vighnaharta', 'sukhkarta', 'aarti'],
        type_specific_data: {
          occasion: 'Ganesh Chaturthi & Daily Evening/Morning Aarti',
          samagri: 'Diya with Ghee, Kapoor, Dhoop, Modak / Laddu, Durva grass, Roli, Akshat',
          benefits: 'Removes hurdles, invites harmony, wisdom, and auspicious beginnings in home and enterprise.'
        },
        translations: [
          {
            language_code: 'hi',
            title: 'श्री गणेश जी की आरती (जय गणेश देवा)',
            slug: 'shri-ganesh-aarti-jai-ganesh-deva-hindi',
            short_description: 'प्रथम पूज्य भगवान श्री गणेश जी की प्रसिद्ध एवं मंगलकारी आरती - जय गणेश जय गणेश देवा।',
            meta_title: 'श्री गणेश जी की आरती - जय गणेश जय गणेश देवा | Shubhkaal',
            meta_description: 'भगवान गणेश जी की पावन आरती जय गणेश जय गणेश देवा, माता जाकी पार्वती पिता महादेवा सम्पूर्ण पाठ।',
            content: `## श्री गणेश जी की आरती

जय गणेश, जय गणेश, जय गणेश देवा।
माता जाकी पार्वती, पिता महादेवा॥ (ध्रुवपद)

एकदंत, दयावंत, चार भुजाधारी।
माथे सिन्दूर सोहे, मूसे की सवारी॥
पान चढ़े, फूल चढ़े, और चढ़े मेवा।
लड्डुअन का भोग लगे, संत करें सेवा॥

जय गणेश, जय गणेश, जय गणेश देवा।
माता जाकी पार्वती, पिता महादेवा॥

अंधन को आँख देत, कोढ़िन को काया।
बांझन को पुत्र देत, निर्धन को माया॥
‘सूर’ श्याम शरण आए, सफल कीजे सेवा।
माता जाकी पार्वती, पिता महादेवा॥

जय गणेश, जय गणेश, जय गणेश देवा।
माता जाकी पार्वती, पिता महादेवा॥`
          },
          {
            language_code: 'mr',
            title: 'श्री सुखकर्ता दुःखहर्ता गणपतीची आरती',
            slug: 'shri-ganesh-aarti-sukhkarta-dukkharta-marathi',
            short_description: 'समर्थ रामदास स्वामी विरचित अत्यंत लोकप्रिय व मंगलमयी श्री गणेशाची आरती - सुखकर्ता दुःखहर्ता.',
            meta_title: 'सुखकर्ता दुःखहर्ता गणपतीची आरती मराठी | Shubhkaal',
            meta_description: 'समर्थ रामदास स्वामी कृत सुखकर्ता दुःखहर्ता वार्ता विघ्नाची संपूर्ण आरती मराठीत. गणपती उत्सवात नित्य म्हणावी.',
            content: `## श्री गणेशाची आरती (सुखकर्ता दुःखहर्ता)

सुखकर्ता दुःखहर्ता वार्ता विघ्नाची।
नुरवी पुरवी प्रेम कृपा जयाची।
सर्वांगी सुंदर उटी शेंदुराची।
कंठी झळके माळ मुक्ताफळांची॥ १॥

जय देव जय देव जय मंगलमूर्ती।
दर्शनमात्रे मनकामना पुरती॥ (ध्रु.)

रत्नखचित फरा तुज गौरीकुमरा।
चंदनाची उटी कुंकुमकेशरा।
हिरेजडित मुकुट शोभतो बरा।
रुणझुणती नूपुरे चरणी घागरिया॥ २॥

जय देव जय देव जय मंगलमूर्ती।
दर्शनमात्रे मनकामना पुरती॥

लंबोदर पीतांबर फणिवरबंधना।
सरळ सोंड वक्रतुंड त्रिनयना।
दास रामाचा वाट पाहे सदना।
संकटी पावावे निर्वाणी रक्षावे सुरवरवंदना॥ ३॥

जय देव जय देव जय मंगलमूर्ती।
दर्शनमात्रे मनकामना पुरती॥`
          },
          {
            language_code: 'en',
            title: 'Shri Ganesh Aarti (Jai Ganesh Deva & Sukhkarta Meaning)',
            slug: 'shri-ganesh-aarti-english',
            short_description: 'Sacred invocation and lyrics to Lord Ganesha, remover of all obstacles and giver of fortune.',
            meta_title: 'Lord Ganesha Aarti - Lyrics with English Meaning | Shubhkaal',
            meta_description: 'Complete Aarti of Lord Ganesha in English with devotional explanation, symbolism, and ritual offerings.',
            content: `## Meaning and Translation of Ganesh Aarti

**Refrain:**
*Victory unto You, O Lord Ganesha! Whose mother is Goddess Parvati and whose father is Lord Mahadeva (Shiva).*

**Verse 1:**
*You possess a single radiant tusk (Ekadanta), are ever compassionate (Dayavanta), and have four powerful arms. Vermilion adorning Your sacred forehead, riding gracefully upon the mouse. Devotees offer betel leaves, fresh flowers, dry fruits, and delicious Modaks while holy saints perform Your loving service.*

**Verse 2:**
*You grant vision to the sightless, heal the afflicted, bless the childless with offspring, and bestow prosperity upon the needy. Taking refuge in You, we pray for auspicious fruition of all righteous aspirations.*`
          }
        ]
      },

      // 3. Maha Mrityunjaya Mantra
      {
        typeCode: 'MANTRA',
        deitySlug: 'shiva',
        categorySlug: 'chants-mantras-stotras',
        is_featured: true,
        sort_order: 3,
        status: 'PUBLISHED',
        image_url: 'https://images.unsplash.com/photo-1567591414240-e2ff01e85567?w=800&auto=format&fit=crop&q=80',
        tags: ['shiva', 'mahadev', 'somwar', 'mantra', 'maha-mrityunjaya'],
        type_specific_data: {
          sacred_verse_sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
          beej_mantra: 'ॐ हौं जूं सः ॐ भूर्भुवः स्वः ॐ त्र्यम्बकं यजामहे...',
          mala_recommended: 'Rudraksha Mala (108 beads)',
          ideal_time: 'Brahma Muhurta or Monday morning during Pradosha',
          benefits: 'Supreme protection from untimely death, physical health recovery, peace of mind and liberation.'
        },
        translations: [
          {
            language_code: 'hi',
            title: 'महामृत्युंजय मंत्र (संस्कृत श्लोक, संपूर्ण अर्थ व जप विधि)',
            slug: 'maha-mrityunjaya-mantra-hindi',
            short_description: 'ऋग्वेद का सर्वशक्तिशाली मृत्युंजय मंत्र, जो समस्त भय, रोग एवं अकाल मृत्यु से रक्षा करता है।',
            meta_title: 'महामृत्युंजय मंत्र - श्लोक, अर्थ एवं जप विधि | Shubhkaal',
            meta_description: 'भगवान शिव का महामृत्युंजय मंत्र ॐ त्र्यम्बकं यजामहे, संपूर्ण अर्थ, जप के नियम और असीम लाभ।',
            content: `## मूल महामृत्युंजय मंत्र

### ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।
### उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥

---

## पदच्छेद एवं शब्दार्थ

* **त्र्यम्बकम्** = तीन नेत्रों वाले भगवान शिव
* **यजामहे** = हम श्रद्धापूर्वक वंदना एवं पूजा करते हैं
* **सुगन्धिम्** = दिव्य सुगंध एवं चेतना से युक्त
* **पुष्टि-वर्धनम्** = समस्त जीव-जगत का पोषण एवं संवर्धन करने वाले
* **उर्वारुकम्-इव** = पके हुए ककड़ी/खरबूजे के समान
* **बन्धनात्** = लता के बंधन अथवा संसार चक्र से
* **मृत्योः-मुक्षीय** = मृत्यु एवं नश्वरता से मुक्त करें
* **मा-अमृतात्** = अमरता तथा मोक्ष से हमें वंचित न करें

---

## मंत्र का भावार्थ
हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो समस्त संसार को जीवन शक्ति व पोषण प्रदान करते हैं। जिस प्रकार पका हुआ फल अपनी लता के बंधन से सरलतापूर्वक पृथक हो जाता है, उसी प्रकार हम संसार के आवागमन, व्याधि व मृत्यु के पाश से मुक्त होकर मोक्ष पद को प्राप्त करें।`
          },
          {
            language_code: 'mr',
            title: 'महामृत्युंजय मंत्र (मराठी अर्थ व जप नियम)',
            slug: 'maha-mrityunjaya-mantra-marathi',
            short_description: 'ऋग्वेदातील सर्वात प्रभावी मृत्युंजय मंत्र, जो सर्व संकटे, आजारपण आणि अकाल मृत्यूपासून संरक्षण करतो.',
            meta_title: 'महामृत्युंजय मंत्र मराठीत - अर्थ व जप पद्धती | Shubhkaal',
            meta_description: 'महामृत्युंजय मंत्राचा संपूर्ण मराठी अर्थ, जप करण्याचे नियम आणि रुद्राक्ष माळेवर जपाचे पुण्य फळ.',
            content: `## मूळ संस्कृत मंत्र

### ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।
### उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥

---

## मराठी भावार्थ
आम्ही त्रिनेत्रधारी भगवान शिवांची भक्तीभावाने उपासना करतो. ते सुगंधी चैतन्यस्वरूप असून विश्वाचे पोषण करणारे आहेत. ज्याप्रमाणे पिकलेली काकडी किंवा फळ देठापासून आपोआप सहज मुक्त होते, त्याचप्रमाणे आम्हाला या सांसारिक बंधनातून आणि मृत्यूच्या भयापासून मुक्त करा आणि अमरत्वाकडे (मोक्षाकडे) घेऊन जा.

### जप कसा करावा?
१. सोमवारी किंवा प्रदोष काळात पूर्वेकडे तोंड करून बसावे.
२. रुद्राक्षाच्या माळेवर १०८ वेळा शांत चित्ताने नामस्मरण करावे.
३. समोर शंकराची मूर्ती किंवा शिवलिंगावर जलाभिषेक करावा.`
          },
          {
            language_code: 'en',
            title: 'Maha Mrityunjaya Mantra (Meaning & Chanting Rules)',
            slug: 'maha-mrityunjaya-mantra-english',
            short_description: 'The ancient and supreme life-giving mantra from the Rigveda for healing, inner peace and divine protection.',
            meta_title: 'Maha Mrityunjaya Mantra - Word-by-Word Meaning & Benefits | Shubhkaal',
            meta_description: 'Learn the sacred Maha Mrityunjaya Mantra with English translation, chanting guidelines, and spiritual vibration significance.',
            content: `## The Great Death-Conquering Mantra

### Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam |
### Urvarukam-Iva Bandhanan Mrityor-Mukshiya Maamritat ||

---

## Word-by-Word Translation

* **Tryambakam:** The Three-Eyed Lord Shiva
* **Yajamahe:** We worship and revere
* **Sugandhim:** The sweet fragrance of supreme consciousness
* **Pushti-Vardhanam:** The nourisher and sustainer of all beings
* **Urvarukam-Iva:** Just like a ripe melon
* **Bandhanat:** From its stem and bondage to the earthly vine
* **Mrityor-Mukshiya:** Liberate us from death and mortality
* **Ma-Amritat:** Never from the realization of immortality and spiritual liberation

---

## Spiritual Essence
We meditate upon the Three-Eyed Lord Shiva, who permeates all creation with divine radiance and nourishes all life. As a ripe fruit effortlessly detaches from the stem, may He release us from the bondage of ignorance and mortality, uniting us with supreme eternal truth.`
          }
        ]
      },

      // 4. Shri Satyanarayan Vrat Katha
      {
        typeCode: 'KATHA',
        deitySlug: 'vishnu',
        categorySlug: 'vrat-fasting-kathas',
        is_featured: true,
        sort_order: 4,
        status: 'PUBLISHED',
        image_url: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&auto=format&fit=crop&q=80',
        tags: ['satyanarayan', 'vrat', 'katha', 'vishnu'],
        type_specific_data: {
          chapters_count: 5,
          ideal_day: 'Purnima (Full Moon Day) or Sankranti',
          prasad: 'Sheera / Panjiri (wheat flour roasted in ghee with sugar, banana slices & tulsi)',
          benefits: 'Brings family harmony, prosperity, fulfillment of vows, and removes obstacles.'
        },
        translations: [
          {
            language_code: 'hi',
            title: 'श्री सत्यनारायण व्रत कथा (सम्पूर्ण ५ अध्याय एवं विधि)',
            slug: 'shri-satyanarayan-vrat-katha-hindi',
            short_description: 'स्कन्द पुराण रेवाखण्ड अन्तर्गत श्री सत्यनारायण भगवान की पावन कथा, पूर्णिमा व्रत एवं पूजा विधि।',
            meta_title: 'श्री सत्यनारायण व्रत कथा सम्पूर्ण ५ अध्याय हिन्दी | Shubhkaal',
            meta_description: 'पूर्णिमा एवं शुभ अवसरों पर पढ़ी जाने वाली श्री सत्यनारायण व्रत कथा, शतानंद ब्राह्मण, काष्ठ विक्रेता एवं साधु वैश्य की कथा।',
            content: `## श्री सत्यनारायण कथा - प्रथम अध्याय

एक समय नैमिषारण्य तीर्थ में शौनकादि ऋषियों ने परम ज्ञानी सूतजी महाराज से पूछा — "हे प्रभु! इस कलियुग में किस व्रत अथवा तपस्या के प्रभाव से मनुष्य को मनोवांछित फल प्राप्त होता है तथा सांसारिक कष्टों से मुक्ति मिलती है?"

सूतजी बोले — "हे मुनिश्रेष्ठों! यही प्रश्न एक बार देवर्षि नारदजी ने भगवान नारायण से पूछा था। तब भगवान विष्णु ने उन्हें सत्यनारायण व्रत का महत्व बताया था।"

भगवान नारायण ने कहा: "जो व्यक्ति सत्य का आचरण करते हुए भक्तिभाव से भगवान सत्यनारायण का पूजन करता है, वह इस लोक में सब सुख भोगकर अंत में मोक्ष को प्राप्त होता है।"

---

## पूजा की आवश्यक सामग्री
* सत्यनारायण भगवान का चित्र / विग्रह
* केला का खंभा, आम के पत्ते, कलश
* पंजीरी प्रसाद (भुना आटा, घी, शर्करा, केला और तुलसी दल)
* पंचामृत (दूध, दही, घी, शहद, गंगाजल)`
          },
          {
            language_code: 'mr',
            title: 'श्री सत्यनारायण पूजा व संपूर्ण पोथी (मराठी)',
            slug: 'shri-satyanarayan-puja-pothi-marathi',
            short_description: 'घरोघरी केल्या जाणाऱ्या सत्यनारायण पूजेची संपूर्ण कथा, मांडणी, साहित्य व ५ अध्यायांची पोथी.',
            meta_title: 'श्री सत्यनारायण पूजा कथा व पोथी मराठीत | Shubhkaal',
            meta_description: 'पौर्णिमा आणि मंगल प्रसंगी वाचन करण्यासाठी श्री सत्यनारायणाची संपूर्ण मराठी पोथी व प्रसादाची कृती.',
            content: `## श्री सत्यनारायण व्रत कथा (मराठी)

स्कंद पुराणातील रेवाखंडातून घेतलेली ही कथा अत्यंत पुण्यदायी आहे. 

### प्रथम अध्याय
नैमिषारण्यात जमलेल्या ऋषींनी सूतजींना विचारले की, "कलिकाल्यात मानवाचे दुःख कसे नाहीसे होईल आणि त्याला सुख-शांती कशी लाभेल?" 
तेव्हा सूतजींनी सांगितले की, "एकदा नारदमुनींनी भगवान विष्णूंकडे पृथ्वीवरील मानवांचे दुःख दूर करण्याचा उपाय विचारला होता. तेव्हा श्रीविष्णूंनी सत्यनारायण व्रताचे माहात्म्य सांगितले."

जे भक्तजन सत्य आणि प्रेमाने सत्यनारायणाचे पूजन करतात, त्यांच्या घरातील सर्व विघ्ने टळतात व सुख-समृद्धी नांदते.`
          },
          {
            language_code: 'en',
            title: 'Shri Satyanarayan Vrat Katha & Pooja Significance',
            slug: 'shri-satyanarayan-katha-english',
            short_description: 'The sacred narrative of Lord Satyanarayana from the Skanda Purana, highlighting truth, devotion, and community worship.',
            meta_title: 'Shri Satyanarayan Vrat Katha - Story & Pooja Rituals | Shubhkaal',
            meta_description: 'Discover the 5 chapters of Shri Satyanarayan Katha in English with ritual guidelines, prasad recipe, and philosophical teachings.',
            content: `## Overview of Satyanarayan Katha

The worship of **Lord Satyanarayana** (Lord Vishnu as the embodiment of Divine Truth) is one of the most celebrated domestic rituals across India.

### Core Message of the Katha
1. **Sacred Truth (Satya):** Living in alignment with truth and fulfilling one's righteous promises.
2. **Universal Inclusivity:** The story narrates how a humble priest (Shatananda), a poor woodcutter, a wealthy merchant, and a powerful king all attained peace through equal devotion without distinction of wealth or status.
3. **Sharing Prasad:** Sincere reverence and sharing the sacred offering (Prasad) with community and family members.`
          }
        ]
      }
    ];

    for (const cData of contentsToSeed) {
      const typeId = typeMap[cData.typeCode];
      const deityId = deityMap[cData.deitySlug] || null;
      const categoryId = categoryMap[cData.categorySlug] || null;

      const firstTrans = cData.translations[0];
      let contentRec = await SpiritualContent.findOne({
        include: [{ model: SpiritualContentTranslation, as: 'translations', where: { slug: firstTrans.slug } }]
      });

      if (!contentRec) {
        contentRec = await SpiritualContent.create({
          type_id: typeId,
          deity_id: deityId,
          category_id: categoryId,
          image_url: cData.image_url,
          is_featured: cData.is_featured || false,
          sort_order: cData.sort_order || 0,
          status: cData.status || 'PUBLISHED',
          type_specific_data: cData.type_specific_data || {}
        });

        // Add Translations
        for (const trans of cData.translations) {
          await SpiritualContentTranslation.create({
            content_id: contentRec.id,
            language_code: trans.language_code,
            title: trans.title,
            slug: trans.slug,
            short_description: trans.short_description,
            content: trans.content,
            meta_title: trans.meta_title,
            meta_description: trans.meta_description,
            status: 'PUBLISHED'
          });
        }

        // Add Tags
        if (cData.tags && cData.tags.length > 0) {
          for (const tSlug of cData.tags) {
            const tagId = tagMap[tSlug];
            if (tagId) {
              await SpiritualContentTag.findOrCreate({
                where: { content_id: contentRec.id, tag_id: tagId },
                defaults: { content_id: contentRec.id, tag_id: tagId }
              });
            }
          }
        }
      }
    }

    console.log('✓ Spiritual / Dharmik CMS Master Data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding Spiritual CMS data:', error.message);
  }
};

module.exports = seedSpiritualData;
