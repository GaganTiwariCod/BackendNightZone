# 🌙 Shubhkaal Backend (NightZone) — Master Documentation

Enterprise Full-Stack Backend Service powering **Shubhkaal** (Sanatan Community Platform, Matrimony, Verified Pandit Booking, Spiritual Wisdom CMS, Vedic Astrology & Kundli, Local Updates & News Aggregator, and Spiritual Events & Meetups).

Built with **Node.js**, **Express.js**, **Sequelize ORM**, and **MySQL**.

---

## 📑 Table of Contents

1. [Architecture & System Overview](#1-architecture--system-overview)
2. [Environment Configuration](#2-environment-configuration)
3. [Database Schema & Sequelize Models](#3-database-schema--sequelize-models)
4. [Service Modules & API Specifications](#4-service-modules--api-specifications)
   - [Module 1: Authentication & Identity Management](#module-1-authentication--identity-management)
   - [Module 2: Matrimony & Family Matching](#module-2-matrimony--family-matching)
   - [Module 3: Pandit Directory & Seva Booking](#module-3-pandit-directory--seva-booking)
   - [Module 4: Spiritual / Dharmik Content CMS](#module-4-spiritual--dharmik-content-cms)
   - [Module 5: Vedic Astrology, Kundli & Astrologer Consultations](#module-5-vedic-astrology-kundli--astrologer-consultations)
   - [Module 6: Local Updates & News Aggregator](#module-6-local-updates--news-aggregator)
   - [Module 7: Spiritual Events & Group Travel / Meetups](#module-7-spiritual-events--group-travel--meetups)
5. [Background Workers & Automation](#5-background-workers--automation)
6. [Automated Verification & Test Scripts](#6-automated-verification--test-scripts)
7. [Installation & Deployment](#7-installation--deployment)

---

## 1. Architecture & System Overview

```
                      ┌─────────────────────────────────────────┐
                      │    Client Layer (React / Vite WebApp)   │
                      └────────────────────┬────────────────────┘
                                           │ Bearer JWT / Cookies
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               Express.js API Gateway (Port 5001)                      │
│  ├── Middlewares: CORS, Helmet, RateLimiter, JWT Auth, RBAC Role Check, Joi Validator  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
  ┌─────────────────┬──────────────────────┼─────────────────────┬──────────────────┐
  ▼                 ▼                      ▼                     ▼                  ▼
Auth & Users    Matrimony            Pandit Directory       Spiritual CMS       Astrology Hub
(/api/v1/auth)  (/api/v1/matrimony)  (/api/v1/pandits)      (/api/v1/spiritual) (/api/v1/astrology)
  │                 │                      │                     │                  │
  ▼                 ▼                      ▼                     ▼                  ▼
Local Updates   Spiritual Events     Background Workers     File Storage        MySQL Database
(/api/v1/news)  (/api/v1/events)     (Cron / RSS Scraping)  (Multer / Static)   (Sequelize ORM)
```

---

## 2. Environment Configuration

Create `.env` in `NightZone/`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nightzone
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Security
JWT_ACCESS_SECRET=shubhkaal_production_jwt_access_secret_2026_!#*
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=shubhkaal_production_jwt_refresh_secret_2026_!#*
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security Policies
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME_MINUTES=15
```

---

## 3. Database Schema & Sequelize Models

All models are centralized in `NightZone/models/index.js` with full foreign key constraints:

| Domain | Model Name | Primary Table | Description |
|---|---|---|---|
| **Auth** | `User` | `users` | User credentials, roles (`CUSTOMER`, `MERCHANT`, `COMPANY`, `ADMIN`), lockout state |
| **Auth** | `RefreshToken` | `refresh_tokens` | Single-use refresh token rotation ledger |
| **Auth** | `EmailOtp` | `email_otps` | 6-digit OTP verification codes |
| **Matrimony** | `MatrimonyProfile` | `matrimony_profiles` | Personal, horoscope, education, family & partner preferences |
| **Matrimony** | `MatrimonyPhoto` | `matrimony_photos` | Multi-image galleries with privacy controls |
| **Matrimony** | `MatrimonyInterest` | `matrimony_interests` | Express Interest requests (`PENDING`, `ACCEPTED`, `REJECTED`) |
| **Pandit** | `PanditProfile` | `pandit_profiles` | Bio, Vedic traditions, languages, verification status |
| **Pandit** | `PanditService` | `pandit_services` | Ceremonies offered, pricing, duration, samagri inclusions |
| **Pandit** | `PanditBooking` | `pandit_bookings` | Devotee bookings, pooja schedules, address, dakshina status |
| **Spiritual** | `SpiritualCategory` | `spiritual_categories` | Hierarchical taxonomy (Pooja, Katha, Mantra, Aarti, Vrat, etc.) |
| **Spiritual** | `SpiritualContent` | `spiritual_contents` | Rich text articles with multilingual support (`hi`, `mr`, `en`) |
| **Spiritual** | `ContentRequest` | `spiritual_content_requests` | Community crowd-sourced requests for missing Kathas/Mantras |
| **Astrology** | `BirthProfile` | `astrology_birth_profiles` | Stored Vedic birth charts (date, time, lat/lng, timezone) |
| **Astrology** | `AstrologerProfile` | `astrologer_profiles` | Certified astrologers, specialties, pricing per min/report |
| **Astrology** | `ConsultationBooking` | `astrology_consultations` | 1-on-1 audio/video sessions and written Kundli reports |
| **Astrology** | `KundliCache` | `kundli_cache` | Cached Vedic planetary positions & 36 Guna Ashtakoot match scores |
| **News** | `NewsArticle` | `news_articles` | Scraped and curated news articles with keyword classification |
| **News** | `NewsSource` | `news_sources` | RSS feed sources and scraping endpoints |
| **News** | `NewsCategory` | `news_categories` | Topics (Temple, Festivals, Heritage, Local Updates) |
| **Events** | `EventCategory` | `event_categories` | 16 database-driven spiritual event categories |
| **Events** | `Event` | `events` | Dates, venue, Yatra assembly, pricing, seat capacity |
| **Events** | `EventLocation` | `event_locations` | Physical address, GPS coordinates, Yatra route |
| **Events** | `EventParticipant` | `event_participants` | "Raise Hand" RSVPs, guest counts, Prasad diet preference, waitlist |
| **Events** | `Meetup` | `event_meetups` | Carpool / Group Travel arrangements (Carpool, Bus, Train) |
| **Events** | `MeetupParticipant` | `meetup_participants` | Group travel passenger list & seats |
| **Events** | `EventAttendance` | `event_attendances` | On-site check-in verification records |
| **Events** | `EventAnnouncement` | `event_announcements` | Real-time broadcast alerts from organizers |
| **Events** | `EventReport` | `event_reports` | Devotee issue reporting and moderation queue |

---

## 4. Service Modules & API Specifications

### Module 1: Authentication & Identity Management

**Base Path**: `/api/v1/auth`

#### 1. Register Account
- **Endpoint**: `POST /api/v1/auth/register`
- **Auth**: None
- **Payload**:
  ```json
  {
    "name": "Gagan Tiwari",
    "email": "gagan@example.com",
    "password": "Password123!",
    "phone": "+919876543210"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": { "id": 1, "name": "Gagan Tiwari", "email": "gagan@example.com", "role": "CUSTOMER" },
      "accessToken": "eyJhbGciOi..."
    }
  }
  ```

#### 2. Login with Password
- **Endpoint**: `POST /api/v1/auth/login`
- **Auth**: None
- **Payload**:
  ```json
  {
    "email": "gagan@example.com",
    "password": "Password123!"
  }
  ```

#### 3. Send / Verify Email OTP
- **Endpoint**: `POST /api/v1/auth/otp/send`
  - Payload: `{ "email": "gagan@example.com", "type": "LOGIN" }`
- **Endpoint**: `POST /api/v1/auth/otp/verify`
  - Payload: `{ "email": "gagan@example.com", "otp": "482910" }`

#### 4. Refresh Token & Logout
- **Endpoint**: `POST /api/v1/auth/refresh-token` (Uses HTTP-only cookie or `{ "refreshToken": "..." }`)
- **Endpoint**: `POST /api/v1/auth/logout` (Revokes refresh token in database)
- **Endpoint**: `GET /api/v1/auth/me` (Header: `Authorization: Bearer <token>`)

---

### Module 2: Matrimony & Family Matching

**Base Path**: `/api/v1/matrimony`

- **Create / Update Profile**: `POST /api/v1/matrimony/profile` (Bearer)
  - Payload:
    ```json
    {
      "gender": "MALE",
      "date_of_birth": "1995-08-15",
      "height_cm": 178,
      "marital_status": "NEVER_MARRIED",
      "religion": "HINDU",
      "caste": "Brahmin",
      "gotra": "Kashyap",
      "manglik_status": "NON_MANGLIK",
      "education_degree": "B.Tech Computer Science",
      "occupation": "Software Engineer",
      "annual_income_lakhs": 24,
      "current_city": "Mumbai"
    }
    ```
- **Browse Matches**: `GET /api/v1/matrimony/browse?gender=FEMALE&min_age=23&max_age=29&city=Mumbai`
- **Send Interest**: `POST /api/v1/matrimony/interest/:targetProfileId`
- **Admin Moderation**: `GET /api/v1/admin/matrimony/profiles` (ADMIN only)

---

### Module 3: Pandit Directory & Seva Booking

**Base Path**: `/api/v1/pandits`

- **Public Directory**: `GET /api/v1/pandits?city=Mumbai&language=Marathi&tradition=Rigvedic`
- **Profile by Slug**: `GET /api/v1/pandits/:slug`
- **Register / Onboard Pandit**: `POST /api/v1/pandits/register` (Bearer)
  - Payload:
    ```json
    {
      "title": "Acharya",
      "full_name": "Rameshwar Shastri",
      "vedic_tradition": "Shukla Yajurveda",
      "experience_years": 18,
      "languages": ["Sanskrit", "Hindi", "Marathi"],
      "city": "Pune",
      "services": [
        { "name": "Maha Ganapati Homam", "price": 3100, "duration_minutes": 90 }
      ]
    }
    ```
- **Book Pandit**: `POST /api/v1/pandits/:panditId/book`
- **Admin Verification**: `PATCH /api/v1/admin/pandits/:panditId/verify` (ADMIN only)

---

### Module 4: Spiritual / Dharmik Content CMS

**Base Path**: `/api/v1/spiritual-content`

- **Content Directory**: `GET /api/v1/spiritual-content?category=aarti&deity=shiva&lang=hi`
- **Content Details**: `GET /api/v1/spiritual-content/:slug?lang=hi`
- **Submit Crowd Request**: `POST /api/v1/spiritual-content/requests`
  - Payload: `{ "title": "Shiv Tandav Stotra with Marathi meaning", "category": "stotra" }`
- **Admin Create Content**: `POST /api/v1/spiritual-content/admin/contents` (ADMIN only)

---

### Module 5: Vedic Astrology, Kundli & Astrologer Consultations

**Base Path**: `/api/v1/astrology`

- **Save Birth Profile**: `POST /api/v1/astrology/profiles` (Bearer)
  - Payload:
    ```json
    {
      "name": "Aditya Sharma",
      "gender": "MALE",
      "relationship": "SELF",
      "date_of_birth": "1994-11-20",
      "time_of_birth": "06:45:00",
      "birth_city": "Varanasi",
      "birth_state": "Uttar Pradesh",
      "latitude": 25.3176,
      "longitude": 82.9739,
      "timezone_offset": 5.5
    }
    ```
- **Calculate Janam Kundli**: `GET /api/v1/astrology/kundli/:profileId`
  - Returns Lagna chart, Planetary positions, Nakshatra, Rashi, and Dasha calculations.
- **Calculate 36 Guna Kundli Matching**: `POST /api/v1/astrology/match-kundli`
  - Payload: `{ "boy_profile_id": 1, "girl_profile_id": 2 }`
  - Returns Ashtakoot score (Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi) out of 36.
- **Book Astrologer Consultation**: `POST /api/v1/astrology/consultations`

---

### Module 6: Local Updates & News Aggregator

**Base Path**: `/api/v1/news`

- **Public News Feed**: `GET /api/v1/news?category=temple-updates&city=Mumbai`
- **Article Details by Slug**: `GET /api/v1/news/:slug`
- **Admin Trigger Scraper**: `POST /api/v1/admin/news/trigger-sync` (ADMIN only)
- **Admin Add RSS Source**: `POST /api/v1/admin/news/sources`

---

### Module 7: Spiritual Events & Group Travel / Meetups

**Base Path**: `/api/v1/events`

#### 1. Public Event Feed (with Haversine GPS Distance)
- **Endpoint**: `GET /api/v1/events`
- **Query Parameters**:
  - `lat`: User latitude (e.g. `19.0760`)
  - `lng`: User longitude (e.g. `72.8777`)
  - `radius`: Radius in km (`5`, `10`, `25`, `50`, `100`)
  - `category`: Category slug (`pooja`, `katha`, `yatra`, etc.)
  - `city`: City filter
  - `is_yatra`: `true` or `false`
  - `start_date`, `end_date`: Date range
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ev_01",
        "title": "Maha Shivaratri 108 Rudrabhishek & Bhajan Sandhya",
        "slug": "maha-shivaratri-108-rudrabhishek-bhajan-sandhya",
        "start_date": "2026-03-08",
        "start_time": "18:00:00",
        "distance_km": 4.8,
        "max_capacity": 500,
        "current_confirmed_count": 340,
        "location": { "venue_name": "Babulnath Mandir", "city": "Mumbai" }
      }
    ]
  }
  ```

#### 2. Raise Hand / Register Participation
- **Endpoint**: `POST /api/v1/events/:eventId/raise-hand`
- **Auth**: Bearer
- **Payload**:
  ```json
  {
    "guests_count": 2,
    "emergency_contact": "+919876543210",
    "dietary_preference": "SATVIK",
    "needs_transport": true,
    "special_notes": "Elderly parents accompanying"
  }
  ```
- **Response**: Status `CONFIRMED` or `WAITLISTED` (if max capacity reached).

#### 3. Connected Meetup / Carpool System
- **List Event Meetups**: `GET /api/v1/events/:eventId/meetups`
- **Create Travel Group**: `POST /api/v1/events/:eventId/meetups`
  - Payload:
    ```json
    {
      "title": "Dadar AC Bus Group",
      "transport_mode": "BUS_GROUP",
      "origin_location": "Dadar Central, Mumbai",
      "departure_time": "2026-03-08T05:00:00Z",
      "total_capacity": 30,
      "cost_sharing_type": "SPLIT_FUEL",
      "estimated_cost_per_person": 350
    }
    ```
- **Join Travel Group**: `POST /api/v1/events/:eventId/meetups/:meetupId/join`

#### 4. Organizer Management & Live Attendance
- **My Organized Events**: `GET /api/v1/events/organizer/my-events`
- **Attendee Check-In**: `POST /api/v1/events/organizer/events/:id/attendance`
  - Payload: `{ "user_id": 42, "status": "ATTENDED" }`
- **Broadcast Announcement**: `POST /api/v1/events/organizer/events/:id/announcements`

---

### Module 8: SEO, Geo-Targeting, Live Metrics & AI Indexing

- **Live Homepage Metrics**: `GET /api/v1/stats/homepage`
  - Returns real-time database counts for Matrimony profiles, verified Pandits, sacred Kathas, Astrologers, news posted today, and upcoming events.
- **Dynamic Community Feed**: `GET /api/v1/stats/community-feed`
  - Returns latest 3 news, 3 upcoming events, and 4 featured Kathas.
- **Dynamic AI LLM Standard Index**: `GET /llms.txt`
  - Provides a machine-readable, deep Markdown index of all active Kathas, Events, Pandits, and News with direct permalinks.
- **Dynamic Search Engine XML Sitemap**: `GET /sitemap.xml`
  - Real XML with `<loc>`, `<lastmod>`, `<changefreq>`, and `<priority>` for all public pages and dynamic slugs.
- **Robots Policy**: `GET /robots.txt`

---

## 5. Background Workers & Automation

- **News Engine Worker** (`NightZone/workers/newsWorker.js`): Fetches RSS feeds and runs classification every 30 minutes.
- **Event Lifecycle Worker** (`NightZone/workers/eventWorker.js`): Transitions events from `PUBLISHED` -> `ONGOING` -> `COMPLETED` and auto-promotes waitlisted devotees upon seat openings.

---

## 6. Automated Verification & Test Scripts

Execute any test script from `NightZone/`:

```bash
# Test Core Auth Flow
node scripts/testAuth.js

# Test Matrimony Registration & Matching
node scripts/testMatrimonyFlow.js

# Test Pandit Onboarding & Verification
node scripts/testPanditFlow.js

# Test Spiritual Content CMS
node scripts/testSpiritualContentFlow.js

# Test Vedic Kundli Calculation & Astrologer Consultations
node scripts/testAstrologyFlow.js

# Test Local Updates & News Engine
node scripts/testNewsFlow.js

# Test Spiritual Events, Haversine GPS, Meetups & Attendance
node scripts/testEventFlow.js
```

---

## 7. Installation & Deployment

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (with nodemon)
npm run dev

# 3. Production start
npm start
```
