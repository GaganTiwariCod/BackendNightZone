const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const matrimonyDir = path.join(__dirname, '..', 'uploads', 'matrimony');
const panditPhotoDir = path.join(__dirname, '..', 'uploads', 'pandit', 'photos');
const panditDocDir = path.join(__dirname, '..', 'uploads', 'pandit', 'documents');
const spiritualDir = path.join(__dirname, '..', 'uploads', 'spiritual');

[matrimonyDir, panditPhotoDir, panditDocDir, spiritualDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage for Matrimony
const matrimonyStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, matrimonyDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `matrimony-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// Storage for Pandit Photos
const panditPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, panditPhotoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `pandit-photo-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// Storage for Pandit Documents
const panditDocStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, panditDocDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `pandit-doc-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// Storage for Spiritual Content Cover Images
const spiritualStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, spiritualDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, `spiritual-${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// Allowed MIME types & extensions for images
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

// Allowed MIME types & extensions for documents (PDF + Images)
const ALLOWED_DOC_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_DOC_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_IMAGE_MIMES.includes(file.mimetype) && ALLOWED_IMAGE_EXTS.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type. Only JPG, PNG, and WEBP images are allowed.'), false);
};

const docFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_DOC_MIMES.includes(file.mimetype) && ALLOWED_DOC_EXTS.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error('Invalid file type. Only PDF, JPG, PNG, and WEBP files are allowed.'), false);
};

// Max 5MB per photo
const uploadMatrimonyPhoto = multer({
  storage: matrimonyStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadPanditPhoto = multer({
  storage: panditPhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadPanditDocument = multer({
  storage: panditDocStorage,
  fileFilter: docFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadSpiritualCover = multer({
  storage: spiritualStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  uploadMatrimonyPhoto,
  uploadPanditPhoto,
  uploadPanditDocument,
  uploadSpiritualCover
};
