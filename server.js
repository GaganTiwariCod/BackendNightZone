const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const { swaggerSpec, swaggerUiCustomOptions } = require('./config/swagger');
const app = express();

/**
 * 1. Security Headers (Helmet)
 * Configured to allow Swagger UI inline assets and styles
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

/**
 * 2. Cross-Origin Resource Sharing (CORS)
 */
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://localhost:5000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, Swagger UI)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy violation: Origin not allowed.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

/**
 * 3. Body Parsing & Cookie Parser
 */
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(cookieParser());

/**
 * 4. Swagger Interactive API Documentation UI
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiCustomOptions));
app.use('/docs', (req, res) => res.redirect('/api-docs'));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * 5. General Rate Limiter (Applied to /api endpoints)
 */
app.use('/api', apiLimiter);

/**
 * 6. Health Check & Root Route
 */
/**
 * @swagger
 * /:
 *   get:
 *     summary: API root overview & link to documentation
 *     tags: [Health & System]
 *     responses:
 *       200:
 *         description: API status and documentation link
 */
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'NightZone Authentication & Identity Microservice 🌙',
    documentation: '/api-docs',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Server health, uptime and status
 *     tags: [Health & System]
 *     responses:
 *       200:
 *         description: Server is running and healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime: { type: number, example: 120.45 }
 *                 status: { type: string, example: 'healthy' }
 *                 timestamp: { type: integer, example: 1726000000000 }
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    uptime: process.uptime(),
    status: 'healthy',
    timestamp: Date.now()
  });
});

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matrimonyRoutes = require('./routes/matrimonyRoutes');
const matrimonyAdminRoutes = require('./routes/matrimonyAdminRoutes');
const panditRoutes = require('./routes/panditRoutes');
const panditAdminRoutes = require('./routes/panditAdminRoutes');
const spiritualRoutes = require('./routes/spiritualRoutes');
const spiritualAdminRoutes = require('./routes/spiritualAdminRoutes');
const astrologyRoutes = require('./routes/astrologyRoutes');
const astrologyAdminRoutes = require('./routes/astrologyAdminRoutes');
const newsRoutes = require('./routes/newsRoutes');
const adminNewsRoutes = require('./routes/adminNewsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminEventRoutes = require('./routes/adminEventRoutes');
const seoAndStatsRoutes = require('./routes/seoAndStatsRoutes');
const seoAndStatsController = require('./controllers/seoAndStatsController');
const { seedMatrimonyData } = require('./seeders/matrimonySeedData');
const seedPanditMasterData = require('./seeders/panditSeedData');
const seedSpiritualData = require('./seeders/spiritualSeedData');
const { seedAstrologyData } = require('./seeders/astrologySeedData');
const { seedNewsData } = require('./seeders/newsSeedData');
const { seedEventData } = require('./seeders/eventSeedData');
const { startNewsWorker } = require('./workers/newsWorker');
const { startEventWorker } = require('./workers/eventWorker');

/**
 * Static file serving for user uploaded photos & documents
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Root SEO, Sitemap & AI Indexing Endpoints
 */
app.get('/llms.txt', (req, res) => seoAndStatsController.getLlmsTxt(req, res));
app.get('/sitemap.xml', (req, res) => seoAndStatsController.getSitemapXml(req, res));
app.get('/robots.txt', (req, res) => seoAndStatsController.getRobotsTxt(req, res));

/**
 * 7. Mount API Version 1 Routes
 */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/matrimony/admin', matrimonyAdminRoutes);
app.use('/api/v1/matrimony', matrimonyRoutes);
app.use('/api/v1/pandits/admin', panditAdminRoutes);
app.use('/api/v1/pandits', panditRoutes);
app.use('/api/v1/spiritual-content/admin', spiritualAdminRoutes);
app.use('/api/v1/spiritual-content', spiritualRoutes);
app.use('/api/v1/admin/astrology', astrologyAdminRoutes);
app.use('/api/v1/astrology', astrologyRoutes);
app.use('/api/v1/admin/local-updates', adminNewsRoutes);
app.use('/api/v1/local-updates', newsRoutes);
app.use('/api/v1/admin/events', adminEventRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1', seoAndStatsRoutes);

/**
 * 8. Error Handling Middlewares
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * 9. Server Initialization & MySQL Database Connection
 */
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await seedMatrimonyData();
  await seedPanditMasterData();
  await seedSpiritualData();
  await seedAstrologyData();
  await seedNewsData();
  await seedEventData();
  startNewsWorker();
  startEventWorker();
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌙 NightZone Auth, Matrimony, Pandit, Astrology & Local Updates Server is running on port ${PORT}`);
    console.log(`🌍 Environment:    ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database:       ${process.env.DB_NAME || 'NightZone'} (MySQL)`);
    console.log(`🚀 API Base URL:   http://localhost:${PORT}/api/v1`);
    console.log(`📚 Swagger Docs:   http://localhost:${PORT}/api-docs`);
    console.log(`======================================================\n`);
  });
};

startServer();

module.exports = app;
