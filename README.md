# 🌙 NightZone Authentication & Identity Microservice

Enterprise-ready Authentication, Authorization, and Identity Management backend service built with **Node.js**, **Express**, **Sequelize ORM**, and **MySQL**.

---

## 🚀 Key Features

- **Relational MySQL Database (`NightZone`)**: Automatically verified and initialized on startup.
- **Dual-Token JWT Architecture**:
  - Short-lived Access Tokens (default: `15m`).
  - Secure HTTP-Only Refresh Tokens (default: `7d`) with automatic rotation and database revocation tracking.
- **Role-Based Access Control (RBAC)**: Supports `ADMIN`, `MERCHANT`, `COMPANY`, and `CUSTOMER` roles.
- **Google OAuth 2.0**: Direct social authentication and auto-provisioning.
- **Account Security**:
  - Bcrypt password hashing (12 salt rounds).
  - Progressive rate limiting against brute-force and credential stuffing.
  - Automatic temporary account lockout after 5 consecutive failed login attempts.
- **Interactive OpenAPI 3.0 / Swagger UI**: Built-in API explorer at `/api-docs`.
- **Joi Validation**: Strict schema validation for all requests.

---

## 📁 Project Structure

```
NightZone/
├── config/
│   ├── db.js             # MySQL connection & DB auto-creation for 'NightZone'
│   └── swagger.js        # OpenAPI 3.0 documentation configuration
├── constants/
│   └── roles.js          # User roles and permissions
├── controllers/
│   ├── authController.js # Auth operations (login, register, OAuth, refresh, logout, password resets)
│   └── userController.js # User profile management & Admin operations
├── middlewares/
│   ├── authMiddleware.js # Bearer token verification
│   ├── roleMiddleware.js # Role-based access control
│   ├── rateLimiter.js    # Rate limiting middlewares
│   ├── validateMiddleware.js # Joi payload validator
│   └── errorMiddleware.js# 404 & Centralized error handler
├── models/
│   ├── User.js           # Main user model with password hashing & lockout hooks
│   ├── RefreshToken.js   # Rotation-enabled Refresh Tokens table
│   ├── CustomerProfile.js# Customer profile details
│   ├── MerchantProfile.js# Merchant store profile
│   ├── CompanyProfile.js # Company B2B profile
│   └── index.js          # Sequelize relationships & model exports
├── routes/
│   ├── authRoutes.js     # /api/v1/auth routes
│   └── userRoutes.js     # /api/v1/users routes
├── utils/
│   ├── apiResponse.js    # Standardized response helper
│   ├── googleAuth.js     # Google OAuth ID token verification
│   ├── tokenUtils.js     # JWT token generators & cookie helpers
│   └── validators.js     # Joi validation schemas
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json          # Node dependencies and scripts
└── server.js             # Express bootstrap & server entry point
```

---

## ⚙️ Configuration (`.env`)

Create or update your `.env` file inside `NightZone/`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=NightZone
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secrets & Expiry
JWT_ACCESS_SECRET=nightzone_production_ready_access_secret_key_2026_@#!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=nightzone_production_ready_refresh_secret_key_2026_@#!
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security Settings
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME_MINUTES=15
```

---

## 🛠️ Installation & Setup

1. **Navigate to the NightZone directory**:
   ```bash
   cd NightZone
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the API & Swagger Documentation**:
   - Health Check: `http://localhost:5001/api/health`
   - Swagger Docs: `http://localhost:5001/api-docs`
   - API Base URL: `http://localhost:5001/api/v1`

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive tokens | No |
| `POST` | `/api/v1/auth/google` | Google OAuth 2.0 social login/register | No |
| `POST` | `/api/v1/auth/refresh-token` | Renew access token with refresh token | No (Cookie/Body) |
| `POST` | `/api/v1/auth/logout` | Revoke session & clear cookies | No |
| `POST` | `/api/v1/auth/forgot-password` | Generate password reset token | No |
| `POST` | `/api/v1/auth/reset-password` | Reset password using reset token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user data & profile | **Yes (Bearer)** |
| `POST` | `/api/v1/auth/change-password` | Change account password | **Yes (Bearer)** |

### 👤 User Management (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `PUT` | `/api/v1/users/profile` | Update self profile | **Yes (Bearer)** |
| `GET` | `/api/v1/users/admin/users` | List all registered users (Paginated) | **Yes (ADMIN)** |
| `PATCH` | `/api/v1/users/admin/users/:userId/role` | Update user role | **Yes (ADMIN)** |
| `PATCH` | `/api/v1/users/admin/users/:userId/status` | Activate/suspend user account | **Yes (ADMIN)** |

---

## 🛡️ Security Best Practices Implemented

- **Password Hashing**: Bcrypt with customizable salt rounds.
- **Account Lockout**: Locks account for `LOCK_TIME_MINUTES` after `MAX_LOGIN_ATTEMPTS` failed attempts.
- **Token Rotation**: Each refresh token is single-use; a new pair is issued on refresh while the old one is revoked.
- **Rate Limiting**:
  - Auth routes (`/login`, `/register`, `/google`): Max 15 attempts / 15 mins.
  - Password reset (`/forgot-password`, `/reset-password`): Max 5 attempts / hour.
  - Global API: Max 300 requests / 15 mins.
- **Secure Cookies**: HTTP-Only cookies with SameSite attributes.
