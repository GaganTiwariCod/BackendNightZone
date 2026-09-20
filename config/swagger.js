const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NightZone Authentication & Authorization API 🌙',
      version: '1.0.0',
      description: `
## Welcome to the NightZone Authentication Service Documentation

NightZone is an enterprise-grade, secure authentication & identity management service built with Express.js, Sequelize ORM, and MySQL.

### 🌟 Key Features:
- **Role-Based Access Control (RBAC)**: Support for \`ADMIN\`, \`MERCHANT\`, \`COMPANY\`, and \`CUSTOMER\` roles with custom profile tables.
- **Dual-Token Architecture**: Short-lived Access Tokens (JWT) + Rotation-enabled HTTP-Only Refresh Tokens.
- **Google OAuth 2.0**: Social authentication with automatic account provisioning.
- **Security & Protection**:
  - Bcrypt password hashing (12 salt rounds).
  - Rate limiting against brute-force & DDoS attacks.
  - Automatic account lockout after consecutive failed attempts.
  - Helmet security headers and CORS protection.
  - Joi payload validation for all routes.
- **Database**: Relational MySQL database (\`NightZone\`) auto-created and synced with Sequelize.

---
### 🔑 Authentication Instructions:
1. Register or Log in via \`/api/v1/auth/login\` or \`/api/v1/auth/register\`.
2. Copy the \`accessToken\` from the JSON response.
3. Click the **Authorize 🔓** button at the top right of this page.
4. Paste the token into the value field in format \`Bearer <your_token>\` or raw token.
5. Click **Authorize** and then **Close**. Protected endpoints will automatically include the token.
      `,
      contact: {
        name: 'NightZone Core Team',
        url: `http://localhost:${PORT}`,
        email: 'support@nightzone.internal'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'NightZone Local Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide your JWT Access Token to access protected routes.'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Invalid credentials or validation error message.' },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: ['"email" must be a valid email']
            }
          }
        },
        RateLimitResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'd3b07384-d113-4672-88f5-f09b5523098d' },
            name: { type: 'string', example: 'Gagan Tiwari' },
            email: { type: 'string', format: 'email', example: 'user@nightzone.com' },
            role: { type: 'string', enum: ['ADMIN', 'CUSTOMER', 'MERCHANT', 'COMPANY'], example: 'CUSTOMER' },
            phone: { type: 'string', example: '+919876543210' },
            isEmailVerified: { type: 'boolean', example: true },
            status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'], example: 'ACTIVE' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CustomerProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            shippingAddress: { type: 'string', example: 'Sector 62, Noida, Uttar Pradesh' },
            loyaltyPoints: { type: 'integer', example: 100 },
            preferences: { type: 'object' }
          }
        },
        MerchantProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            storeName: { type: 'string', example: 'NightZone Store Hub' },
            storeSlug: { type: 'string', example: 'nightzone-store-hub' },
            isApproved: { type: 'boolean', example: false },
            commissionRate: { type: 'number', example: 5.00 }
          }
        },
        CompanyProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            companyName: { type: 'string', example: 'NightZone Enterprises Ltd' },
            taxId: { type: 'string', example: 'GSTIN07ABCDE1234F1Z5' },
            isVerified: { type: 'boolean', example: false },
            creditLimit: { type: 'number', example: 1000000 }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Alex Mercer' },
            email: { type: 'string', format: 'email', example: 'alex@nightzone.com' },
            password: { type: 'string', format: 'password', example: 'SecureP@ssw0rd123' },
            role: { type: 'string', enum: ['CUSTOMER', 'MERCHANT', 'COMPANY'], default: 'CUSTOMER' },
            phone: { type: 'string', example: '+919876543210' },
            merchantDetails: {
              type: 'object',
              properties: {
                storeName: { type: 'string', example: 'Apex Goods' },
                storeSlug: { type: 'string', example: 'apex-goods' },
                businessRegNumber: { type: 'string', example: 'REG-543210' },
                storeDescription: { type: 'string', example: 'Specialty electronics and lifestyle' }
              }
            },
            companyDetails: {
              type: 'object',
              properties: {
                companyName: { type: 'string', example: 'Nexus Corporate Ltd' },
                taxId: { type: 'string', example: 'TAX-99887766' },
                corporateEmail: { type: 'string', format: 'email', example: 'corporate@nexus.com' },
                businessPhone: { type: 'string', example: '+911122334455' },
                billingAddress: { type: 'string', example: 'Cyber City, Gurugram, India' }
              }
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alex@nightzone.com' },
            password: { type: 'string', format: 'password', example: 'SecureP@ssw0rd123' }
          }
        },
        GoogleAuthRequest: {
          type: 'object',
          required: ['idToken'],
          properties: {
            idToken: { type: 'string', example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...' },
            role: { type: 'string', enum: ['CUSTOMER', 'MERCHANT', 'COMPANY'], default: 'CUSTOMER' }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', format: 'password', example: 'OldP@ssw0rd123' },
            newPassword: { type: 'string', format: 'password', example: 'NewSecureP@ssw0rd123!' }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@nightzone.com' }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: { type: 'string', example: 'f87a3e9c1b2d4e5f6a7b8c9d0e1f2a3b' },
            newPassword: { type: 'string', format: 'password', example: 'NewSecureP@ssw0rd123!' }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Alex Mercer' },
            phone: { type: 'string', example: '+919999988888' },
            avatarUrl: { type: 'string', format: 'uri', example: 'https://example.com/avatar.jpg' },
            shippingAddress: { type: 'string', example: '123 Cyber Avenue, Neo Delhi' },
            preferences: { type: 'object', example: { theme: 'dark', notifications: true } }
          }
        },
        UpdateRoleRequest: {
          type: 'object',
          required: ['role'],
          properties: {
            role: { type: 'string', enum: ['ADMIN', 'CUSTOMER', 'MERCHANT', 'COMPANY'], example: 'MERCHANT' }
          }
        }
      }
    },
    tags: [
      { name: 'Health & System', description: 'NightZone health and uptime diagnostic endpoints' },
      { name: 'Authentication', description: 'User registration, login, token refresh, Google OAuth, and password operations' },
      { name: 'User Profile', description: 'Authenticated user profile retrieval and management' },
      { name: 'Admin', description: 'Administrative actions (User management, status modification)' }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiCustomOptions = {
  customSiteTitle: 'NightZone Authentication Service API Docs',
  customCss: `
    .swagger-ui .topbar { background-color: #0f172a; border-bottom: 2px solid #3b82f6; }
    .swagger-ui .topbar .topbar-wrapper .link span { color: #60a5fa; font-weight: bold; font-size: 1.15rem; }
    .swagger-ui .info .title { color: #1e3a8a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .swagger-ui .btn.authorize { background-color: #2563eb; color: #ffffff; border-color: #2563eb; border-radius: 6px; }
    .swagger-ui .btn.authorize svg { fill: #ffffff; }
    .swagger-ui .opblock.opblock-post { border-color: #3b82f6; background: rgba(59, 130, 246, .05); border-radius: 8px; }
    .swagger-ui .opblock.opblock-get { border-color: #10b981; background: rgba(16, 185, 129, .05); border-radius: 8px; }
    .swagger-ui .opblock.opblock-put { border-color: #f59e0b; background: rgba(245, 158, 11, .05); border-radius: 8px; }
    .swagger-ui .opblock.opblock-patch { border-color: #8b5cf6; background: rgba(139, 92, 246, .05); border-radius: 8px; }
    .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, .05); border-radius: 8px; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true
  }
};

module.exports = {
  swaggerSpec,
  swaggerUiCustomOptions
};
