const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AstrologerProfile extends Model {}

AstrologerProfile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    display_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    profile_photo: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      defaultValue: 'male'
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    alternate_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    education: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    certifications: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    training: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    languages: {
      type: DataTypes.JSON,
      defaultValue: ['Hindi', 'English'],
      comment: 'Array of languages spoken'
    },
    specializations: {
      type: DataTypes.JSON,
      defaultValue: ['Vedic Astrology', 'Kundli', 'Kundli Matching'],
      comment: 'Vedic Astrology, Kundli, Kundli Matching, Numerology, Vastu, Muhurta, Marriage, Career, Business, Palmistry'
    },
    astrology_methods: {
      type: DataTypes.JSON,
      defaultValue: ['Parashari', 'Jaimini', 'KP Astrology'],
      comment: 'Array of astrological methods'
    },
    supported_services: {
      type: DataTypes.JSON,
      defaultValue: ['Chat', 'Audio Call', 'Video Call', 'Report', 'Kundli Analysis', 'Kundli Matching'],
      comment: 'Array of supported consultation and report types'
    },
    chat_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 15.00,
      comment: 'Price per minute for chat'
    },
    call_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 25.00,
      comment: 'Price per minute for audio call'
    },
    video_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 35.00,
      comment: 'Price per minute for video call'
    },
    report_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 499.00,
      comment: 'Base price for detailed PDF report'
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED'),
      defaultValue: 'PENDING'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.00
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    consultation_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_online: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'AstrologerProfile',
    tableName: 'astrologer_profiles',
    timestamps: true,
    underscored: true
  }
);

module.exports = AstrologerProfile;
