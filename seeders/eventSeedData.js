const { EventCategory, Event, EventLocation, Meetup, User } = require('../models');
const { generateUniqueSlug } = require('../utils/slugGenerator');

const CATEGORIES_DATA = [
  { name: 'Pooja', slug: 'pooja', icon: 'Sun', description: 'Sacred poojas, havans, and Vedic rituals performed by pandits.' },
  { name: 'Aarti', slug: 'aarti', icon: 'Bell', description: 'Maha aartis, deepotsav, and daily temple worship.' },
  { name: 'Katha', slug: 'katha', icon: 'BookOpen', description: 'Shrimad Bhagwat Katha, Ramcharitmanas paath, and Shiv Puran pravachan.' },
  { name: 'Yatra', slug: 'yatra', icon: 'Navigation', description: 'Sacred pilgrimage tours, parikramas, and spiritual journeys.' },
  { name: 'Satsang', slug: 'satsang', icon: 'Users', description: 'Community spiritual gatherings, discourses, and devotional sangathans.' },
  { name: 'Bhajan', slug: 'bhajan', icon: 'Music', description: 'Divine bhajan sandhyas and melodious kirtans.' },
  { name: 'Kirtan', slug: 'kirtan', icon: 'Mic2', description: 'Akhand Harinaam kirtan and devotional singing.' },
  { name: 'Havan', slug: 'havan', icon: 'Flame', description: 'Maha Yagyas, Gayatri havan, and Navagraha shanti homam.' },
  { name: 'Religious Festival', slug: 'religious-festival', icon: 'Sparkles', description: 'Navratri, Ganesh Utsav, Diwali, and Mahashivratri celebrations.' },
  { name: 'Temple Visit', slug: 'temple-visit', icon: 'Landmark', description: 'Group darshans, temple utsavas, and heritage temple walks.' },
  { name: 'Spiritual Meetup', slug: 'spiritual-meetup', icon: 'Compass', description: 'Youth meetups, Vedic philosophy clubs, and spiritual book discussions.' },
  { name: 'Spiritual Workshop', slug: 'spiritual-workshop', icon: 'Award', description: 'Vedic chanting, meditation workshops, and yoga intensives.' },
  { name: 'Seva', slug: 'seva', icon: 'Heart', description: 'Temple cleaning, annadaan, tree planting, and gau seva drives.' },
  { name: 'Darshan', slug: 'darshan', icon: 'Eye', description: 'Special deity darshan queues, vip entry arrangements, and abhishekams.' },
  { name: 'Pilgrimage', slug: 'pilgrimage', icon: 'MapPin', description: 'Char Dham, Jyotirlinga, and Ashtavinayak yatras.' },
  { name: 'Other', slug: 'other', icon: 'MoreHorizontal', description: 'Other community dharmik events and ceremonies.' }
];

const DEMO_EVENTS = [
  {
    title: 'Grand Hanuman Jayanti Maha Aarti & Sundarkand Paath',
    categorySlug: 'aarti',
    short_description: 'Join thousands of devotees for divine Sundarkand paath followed by 108 Diya Maha Aarti.',
    full_description: 'Celebrate the divine appearance day of Lord Hanuman with Vedic mantras, melodious bhajans, and sacred prasad distribution. Everyone is welcome with their families.',
    cover_image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-10-15',
    start_time: '18:30',
    end_date: '2026-10-15',
    end_time: '21:30',
    has_capacity: true,
    max_participants: 250,
    allow_guests: true,
    max_guests_per_user: 4,
    enable_waitlist: true,
    requires_confirmation: false,
    tags: ['Hanuman', 'Aarti', 'Sundarkand', 'Mumbai'],
    location: {
      venue_name: 'Shri Hanuman Mandir Ground',
      address: 'Near Gateway of India, Colaba',
      area: 'Colaba',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      latitude: 18.9220,
      longitude: 72.8347
    }
  },
  {
    title: 'Ashtavinayak Sacred Pilgrimage & Yatra (3-Day Tour)',
    categorySlug: 'yatra',
    short_description: 'Complete 8 sacred Ganesha temple darshans with comfortable AC bus travel and sattvik meals.',
    full_description: 'Embark on a divine 3-day spiritual yatra covering all Ashtavinayak temples across Maharashtra: Mayureshwar, Siddhivinayak, Ballaleshwar, Varadavinayak, Chintamani, Girijatmaj, Vighnahar, and Mahaganapati.',
    cover_image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-11-05',
    start_time: '06:00',
    end_date: '2026-11-07',
    end_time: '20:00',
    has_capacity: true,
    max_participants: 45,
    allow_guests: true,
    max_guests_per_user: 2,
    enable_waitlist: true,
    requires_confirmation: true,
    tags: ['Yatra', 'Ganesh', 'Ashtavinayak', 'Pilgrimage'],
    location: {
      venue_name: 'Mayureshwar Temple (Starting Point)',
      address: 'Morgaon, Taluka Baramati',
      area: 'Morgaon',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '412304',
      latitude: 18.2770,
      longitude: 74.3168,
      meeting_point_name: 'Dadar Swaminarayan Mandir Gate, Mumbai',
      meeting_point_address: 'Opp. Dadar Central Railway Station, Dadar East, Mumbai',
      meeting_point_latitude: 19.0178,
      meeting_point_longitude: 72.8478,
      meeting_time: '05:30 AM',
      meeting_instructions: 'Please arrive 15 minutes before departure with photo ID and light luggage.'
    },
    meetups: [
      {
        name: 'Dadar & South Mumbai Group',
        description: 'AC Bus departure group meeting at Dadar Station for shared travel to Morgaon.',
        starting_location: 'Dadar Railway Station East, Mumbai',
        starting_latitude: 19.0178,
        starting_longitude: 72.8478,
        meetup_date: '2026-11-05',
        meetup_time: '05:30',
        max_members: 25,
        transport_type: 'bus'
      },
      {
        name: 'Thane & Navi Mumbai Carpool Group',
        description: 'Coordinated convoy & carpool meeting at Vashi Toll Plaza.',
        starting_location: 'Vashi Toll Plaza, Navi Mumbai',
        starting_latitude: 19.0657,
        starting_longitude: 72.9904,
        meetup_date: '2026-11-05',
        meetup_time: '06:15',
        max_members: 15,
        transport_type: 'car'
      }
    ]
  },
  {
    title: '7-Day Shrimad Bhagwat Katha Gyan Yagya by Pujya Acharya',
    categorySlug: 'katha',
    short_description: 'Experience pure bliss and transcendental wisdom through divine Shrimad Bhagwat Pravachan.',
    full_description: 'Daily katha discourses covering Krishna Janma, Govardhan Leela, and Raas Utsav with live devotional music, rasleela drama, and maha prasad.',
    cover_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-10-20',
    start_time: '15:00',
    end_date: '2026-10-26',
    end_time: '19:00',
    has_capacity: true,
    max_participants: 500,
    allow_guests: true,
    max_guests_per_user: 6,
    enable_waitlist: false,
    requires_confirmation: false,
    tags: ['Bhagwat', 'Katha', 'Krishna', 'Satsang'],
    location: {
      venue_name: 'ISKCON Temple Auditorium',
      address: 'Hare Krishna Land, Juhu',
      area: 'Juhu',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400049',
      latitude: 19.1075,
      longitude: 72.8262
    }
  },
  {
    title: 'Navgrah Shanti Havan & Vedic Chanting Workshop',
    categorySlug: 'havan',
    short_description: 'Learn ancient Vedic mantras, fire rituals, and planetary balance remedies with certified pandits.',
    full_description: 'A sacred half-day workshop and mass havan for clearing cosmic obstacles, invoking positive prana, and learning daily Vedic rituals for home peace.',
    cover_image: 'https://images.unsplash.com/photo-1609137144822-4467005c2199?w=800&auto=format&fit=crop&q=80',
    start_date: '2026-10-28',
    start_time: '08:00',
    end_date: '2026-10-28',
    end_time: '13:00',
    has_capacity: true,
    max_participants: 80,
    allow_guests: true,
    max_guests_per_user: 2,
    enable_waitlist: true,
    requires_confirmation: false,
    tags: ['Havan', 'Navgrah', 'Vedic', 'Pune'],
    location: {
      venue_name: 'Vedic Gurukul Ashram',
      address: 'Sinhagad Road, Anand Nagar',
      area: 'Sinhagad Road',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411051',
      latitude: 18.4720,
      longitude: 73.8180
    }
  }
];

const seedEventData = async () => {
  try {
    // 1. Seed Categories
    const categoryMap = {};
    for (const catData of CATEGORIES_DATA) {
      const [cat] = await EventCategory.findOrCreate({
        where: { slug: catData.slug },
        defaults: catData
      });
      categoryMap[catData.slug] = cat.id;
    }

    // 2. Check if events already seeded
    const eventCount = await Event.count();
    if (eventCount === 0) {
      // Find admin or first user as organizer
      let organizer = await User.findOne({ where: { role: 'ADMIN' } });
      if (!organizer) organizer = await User.findOne();
      if (!organizer) return;

      for (const item of DEMO_EVENTS) {
        const categoryId = categoryMap[item.categorySlug] || Object.values(categoryMap)[0];
        const slug = await generateUniqueSlug(Event, item.title);

        const createdEvent = await Event.create({
          organizer_id: organizer.id,
          category_id: categoryId,
          title: item.title,
          slug,
          short_description: item.short_description,
          full_description: item.full_description,
          cover_image: item.cover_image,
          status: 'published',
          visibility: 'public',
          start_date: item.start_date,
          start_time: item.start_time,
          end_date: item.end_date,
          end_time: item.end_time,
          has_capacity: item.has_capacity,
          max_participants: item.max_participants,
          allow_guests: item.allow_guests,
          max_guests_per_user: item.max_guests_per_user,
          enable_waitlist: item.enable_waitlist,
          auto_promote_waitlist: true,
          requires_confirmation: item.requires_confirmation,
          tags: item.tags,
          views_count: Math.floor(Math.random() * 80) + 20
        });

        // Create Location
        if (item.location) {
          await EventLocation.create({
            event_id: createdEvent.id,
            ...item.location
          });
        }

        // Create Meetups if present
        if (item.meetups && item.meetups.length > 0) {
          for (const m of item.meetups) {
            const mSlug = await generateUniqueSlug(Meetup, m.name);
            await Meetup.create({
              event_id: createdEvent.id,
              organizer_id: organizer.id,
              name: m.name,
              slug: mSlug,
              description: m.description,
              starting_location: m.starting_location,
              starting_latitude: m.starting_latitude,
              starting_longitude: m.starting_longitude,
              meetup_date: m.meetup_date,
              meetup_time: m.meetup_time,
              max_members: m.max_members,
              transport_type: m.transport_type,
              status: 'active'
            });
          }
        }
      }
      console.log('✅ Spiritual Events & Meetups Seed Data created successfully!');
    }
  } catch (error) {
    console.error('Error seeding Event data:', error);
  }
};

module.exports = {
  seedEventData,
  CATEGORIES_DATA
};
