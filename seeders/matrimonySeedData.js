const { MasterHobby } = require('../models');

const SEED_HOBBIES = [
  { name: 'Travel & Exploring', category: 'Activities', icon: '✈️' },
  { name: 'Music & Concerts', category: 'Arts', icon: '🎵' },
  { name: 'Reading & Literature', category: 'Intellectual', icon: '📚' },
  { name: 'Cooking & Baking', category: 'Culinary', icon: '🍳' },
  { name: 'Fitness & Gym', category: 'Health', icon: '🏋️' },
  { name: 'Photography', category: 'Arts', icon: '📷' },
  { name: 'Yoga & Meditation', category: 'Health', icon: '🧘' },
  { name: 'Movies & Cinema', category: 'Entertainment', icon: '🎬' },
  { name: 'Spirituality & Pooja', category: 'Culture', icon: '🪔' },
  { name: 'Cricket & Sports', category: 'Activities', icon: '🏏' },
  { name: 'Technology & Coding', category: 'Tech', icon: '💻' },
  { name: 'Volunteering & Seva', category: 'Social', icon: '🤝' },
  { name: 'Art & Painting', category: 'Arts', icon: '🎨' },
  { name: 'Dancing', category: 'Arts', icon: '💃' },
  { name: 'Gardening & Nature', category: 'Lifestyle', icon: '🌱' }
];

const MASTER_DATA = {
  religions: [
    { name: 'Hindu', communities: ['Brahmin', 'Kshatriya', 'Vaishya', 'Maratha', 'Kayastha', 'Rajput', 'Agarwal', 'Gupta', 'Jat', 'Yadav', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Iyengar', 'Other'] },
    { name: 'Jain', communities: ['Digambar', 'Shwetambar', 'Oswal', 'Khandelwal', 'Porwal', 'Other'] },
    { name: 'Sikh', communities: ['Jat', 'Khatri', 'Arora', 'Ramgarhia', 'Saini', 'Other'] },
    { name: 'Buddhist', communities: ['Navayana', 'Mahayana', 'Theravada', 'Other'] },
    { name: 'Muslim', communities: ['Sunni', 'Shia', 'Ansari', 'Syed', 'Sheikh', 'Pathan', 'Other'] },
    { name: 'Christian', communities: ['Catholic', 'Protestant', 'Syrian Catholic', 'Orthodox', 'Other'] },
    { name: 'Parsi', communities: ['Irani', 'Parsi'] },
    { name: 'Jewish', communities: ['Bene Israel', 'Baghdadi', 'Cochin'] },
    { name: 'Other', communities: ['Other'] },
    { name: 'Prefer not to say', communities: ['General'] }
  ],
  motherTongues: [
    'Hindi', 'Marathi', 'Gujarati', 'Punjabi', 'Bengali', 'Tamil', 'Telugu', 
    'Kannada', 'Malayalam', 'Odia', 'Marwari', 'Bhojpuri', 'Sindhi', 'Urdu', 'English', 'Konkani', 'Assamese'
  ],
  educationLevels: [
    'High School (10th)', 'Higher Secondary (12th)', 'Diploma / Polytechnic', 
    'Bachelor of Arts (BA)', 'Bachelor of Science (B.Sc)', 'Bachelor of Commerce (B.Com)', 
    'Bachelor of Engineering / B.Tech', 'Bachelor of Computer Applications (BCA)', 
    'Bachelor of Medicine / MBBS', 'Bachelor of Dental Surgery (BDS)', 'Bachelor of Pharmacy (B.Pharm)',
    'Bachelor of Law (LLB)', 'Master of Business Administration (MBA)', 'Master of Technology (M.Tech)',
    'Master of Science (M.Sc)', 'Master of Arts (MA)', 'Chartered Accountant (CA)', 'MD / MS (Medicine)', 
    'PhD / Doctorate', 'Other Degree'
  ],
  professions: [
    'Software Engineer / IT Professional', 'Doctor / Surgeon', 'Chartered Accountant / Finance',
    'Banker / Financial Analyst', 'Business Owner / Entrepreneur', 'Civil / Mechanical Engineer',
    'Government / PSU Officer', 'Teacher / Professor / Academic', 'Civil Services (IAS/IPS/IFS)',
    'Lawyer / Legal Advisor', 'Architect / Interior Designer', 'Marketing / Sales Executive',
    'Human Resources (HR)', 'Management Consultant', 'Scientist / Researcher', 'Journalist / Writer',
    'Healthcare / Nurse / Pharmacist', 'Hospitality / Chef', 'Armed Forces / Police', 'Other'
  ],
  rashis: [
    'Mesh (Aries)', 'Vrishabh (Taurus)', 'Mithun (Gemini)', 'Kark (Cancer)',
    'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchik (Scorpio)',
    'Dhanu (Sagittarius)', 'Makar (Capricorn)', 'Kumbha (Aquarius)', 'Meen (Pisces)',
    'Don\'t Know'
  ],
  nakshatras: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
    'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
    'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
    'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati', 'Don\'t Know'
  ]
};

const seedMatrimonyData = async () => {
  try {
    const count = await MasterHobby.count();
    if (count === 0) {
      await MasterHobby.bulkCreate(SEED_HOBBIES);
      console.log('✅ Matrimony Master Hobbies seeded successfully.');
    }
  } catch (error) {
    console.warn('⚠️ Seeding hobbies skipped/failed:', error.message);
  }
};

module.exports = {
  MASTER_DATA,
  seedMatrimonyData
};
