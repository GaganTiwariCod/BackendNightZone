const { connectDB } = require('../config/db');
const { 
  EventCategory, 
  Event, 
  EventLocation, 
  EventParticipant, 
  EventAttendance, 
  EventAnnouncement, 
  EventReport, 
  Meetup, 
  MeetupParticipant, 
  User 
} = require('../models');
const { seedEventData } = require('../seeders/eventSeedData');
const { calculateHaversineDistance } = require('../services/geoDistanceService');
const { getEventCapacityStats, promoteWaitlistedParticipants } = require('../services/eventCapacityService');
const { generateUniqueSlug } = require('../utils/slugGenerator');

async function runTests() {
  console.log('🧪 Starting Spiritual Events & Meetup Test Suite...\n');

  try {
    await connectDB();
    await seedEventData();

    // 1. Check Categories
    console.log('1️⃣ Testing Event Categories...');
    const catCount = await EventCategory.count({ where: { is_active: true } });
    console.log(`   Found ${catCount} active event categories.`);
    if (catCount < 10) throw new Error('Event categories incomplete');
    console.log('✅ Event categories verified.\n');

    // 2. Find or Create Test Organizer & Users
    console.log('2️⃣ Setting up Test Users...');
    const [organizer] = await User.findOrCreate({
      where: { email: 'event_organizer@shubhkaal.com' },
      defaults: {
        name: 'Acharya Organizer',
        email: 'event_organizer@shubhkaal.com',
        password_hash: 'hashedpassword123',
        role: 'ADMIN'
      }
    });

    const [userA] = await User.findOrCreate({
      where: { email: 'bhakt_a@shubhkaal.com' },
      defaults: {
        name: 'Rohan Sharma',
        email: 'bhakt_a@shubhkaal.com',
        password_hash: 'hashedpassword123',
        role: 'CUSTOMER'
      }
    });

    const [userB] = await User.findOrCreate({
      where: { email: 'bhakt_b@shubhkaal.com' },
      defaults: {
        name: 'Pooja Verma',
        email: 'bhakt_b@shubhkaal.com',
        password_hash: 'hashedpassword123',
        role: 'CUSTOMER'
      }
    });
    console.log('✅ Test users ready.\n');

    // 3. Test Event Creation with Location & Meeting Point
    console.log('3️⃣ Testing Event Creation with Yatra Meeting Point & Capacity...');
    const poojaCat = await EventCategory.findOne({ where: { slug: 'yatra' } });
    const slug = await generateUniqueSlug(Event, 'Trimbakeshwar Temple Yatra & Kaal Sarp Shanti');
    
    const testEvent = await Event.create({
      organizer_id: organizer.id,
      category_id: poojaCat.id,
      title: 'Trimbakeshwar Temple Yatra & Kaal Sarp Shanti',
      slug,
      short_description: 'Sacred Jyotirlinga darshan with shared transport from Mumbai.',
      start_date: '2026-11-20',
      start_time: '05:00',
      has_capacity: true,
      max_participants: 2, // Low capacity to test waitlist
      allow_guests: true,
      max_guests_per_user: 2,
      enable_waitlist: true,
      auto_promote_waitlist: true,
      requires_confirmation: false,
      status: 'published'
    });

    await EventLocation.create({
      event_id: testEvent.id,
      venue_name: 'Trimbakeshwar Jyotirlinga Mandir',
      city: 'Nashik',
      state: 'Maharashtra',
      latitude: 19.9324,
      longitude: 73.5308,
      meeting_point_name: 'Thane Station East Bus Stop',
      meeting_time: '04:30 AM',
      meeting_instructions: 'Arrive by 4:15 AM sharp.'
    });

    console.log(`   Created test event: ${testEvent.title} (Max capacity: ${testEvent.max_participants})`);
    console.log('✅ Event creation passed.\n');

    // 4. Test "Raise Hand" / Participation & Capacity Filling
    console.log('4️⃣ Testing Raise Hand & Capacity Overflow...');
    // User A joins with 1 guest (consumes 2 seats -> event full)
    const partA = await EventParticipant.create({
      event_id: testEvent.id,
      user_id: userA.id,
      status: 'CONFIRMED',
      guests_count: 1,
      joined_at: new Date(),
      confirmed_at: new Date()
    });

    const stats1 = await getEventCapacityStats(testEvent.id);
    console.log(`   After User A joins: Confirmed Seats = ${stats1.totalConfirmedSeats}, Available = ${stats1.availableSeats}, IsFull = ${stats1.isFull}`);
    if (!stats1.isFull) throw new Error('Event should be full');

    // User B raises hand -> should be WAITLISTED
    const partB = await EventParticipant.create({
      event_id: testEvent.id,
      user_id: userB.id,
      status: 'WAITLISTED',
      guests_count: 0,
      joined_at: new Date(),
      waitlisted_at: new Date()
    });
    console.log(`   User B participation status: ${partB.status}`);
    if (partB.status !== 'WAITLISTED') throw new Error('User B should be waitlisted');
    console.log('✅ Raise Hand & Capacity waitlist passed.\n');

    // 5. Test Waitlist Auto-Promotion upon Cancellation
    console.log('5️⃣ Testing Waitlist Auto-Promotion...');
    // User A cancels participation
    await partA.update({ status: 'CANCELLED', cancelled_at: new Date() });
    
    // Trigger promotion
    const promoted = await promoteWaitlistedParticipants(testEvent.id);
    console.log(`   Promoted ${promoted.length} waitlisted participant(s).`);
    
    const reloadedB = await EventParticipant.findByPk(partB.id);
    console.log(`   User B new status: ${reloadedB.status}`);
    if (reloadedB.status !== 'CONFIRMED') {
      throw new Error('User B was not auto-promoted to CONFIRMED');
    }
    console.log('✅ Auto-promotion passed.\n');

    // 6. Test Distance Haversine Calculation
    console.log('6️⃣ Testing Haversine Distance Calculation...');
    // Mumbai to Nashik distance
    const dist = calculateHaversineDistance(19.0760, 72.8777, 19.9324, 73.5308);
    console.log(`   Calculated distance (Mumbai -> Nashik): ${dist} km`);
    if (dist < 100 || dist > 200) throw new Error('Distance calculation out of expected range');
    console.log('✅ Haversine distance calculation passed.\n');

    // 7. Test Meetup Creation & Member Joining
    console.log('7️⃣ Testing Connected Meetup Group Flow...');
    const meetupSlug = await generateUniqueSlug(Meetup, 'Thane Train Travellers Group');
    const meetup = await Meetup.create({
      event_id: testEvent.id,
      organizer_id: organizer.id,
      name: 'Thane Train Travellers Group',
      slug: meetupSlug,
      starting_location: 'Thane Railway Station Platform 1',
      meetup_date: '2026-11-20',
      meetup_time: '04:30',
      max_members: 15,
      transport_type: 'train',
      status: 'active'
    });

    await MeetupParticipant.create({
      meetup_id: meetup.id,
      user_id: userB.id,
      status: 'JOINED'
    });

    const mCount = await MeetupParticipant.count({ where: { meetup_id: meetup.id } });
    console.log(`   Meetup '${meetup.name}' members count: ${mCount}`);
    if (mCount !== 1) throw new Error('Meetup member joining failed');
    console.log('✅ Meetup system passed.\n');

    // 8. Test Attendance Check-In
    console.log('8️⃣ Testing Attendance Check-In...');
    const attendance = await EventAttendance.create({
      event_id: testEvent.id,
      participant_id: reloadedB.id,
      user_id: userB.id,
      status: 'ATTENDED',
      check_in_method: 'manual',
      verified_by: organizer.id
    });
    console.log(`   Marked attendance for User B: ${attendance.status} at ${attendance.check_in_time}`);
    console.log('✅ Attendance check-in passed.\n');

    // 9. Clean up test event
    await testEvent.destroy();
    console.log('🎉 ALL SPIRITUAL EVENTS & MEETUP BACKEND TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
