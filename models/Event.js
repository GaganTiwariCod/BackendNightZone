const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Event extends Model {}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    organizer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(350),
      allowNull: false,
      unique: true
    },
    short_description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    full_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cover_image: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    additional_images: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM(
        'draft',
        'pending_review',
        'published',
        'registration_open',
        'registration_closed',
        'ongoing',
        'completed',
        'cancelled',
        'rejected',
        'archived'
      ),
      defaultValue: 'published'
    },
    visibility: {
      type: DataTypes.ENUM('public', 'registered_only', 'private'),
      defaultValue: 'public'
    },
    language: {
      type: DataTypes.STRING(50),
      defaultValue: 'Hindi / Marathi / English'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    contact_person: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.STRING(20),
      defaultValue: '09:00'
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_time: {
      type: DataTypes.STRING(20),
      defaultValue: '18:00'
    },
    is_all_day: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'Asia/Kolkata'
    },
    registration_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    registration_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurring_pattern: {
      type: DataTypes.STRING(50),
      defaultValue: 'none' // 'none', 'daily', 'weekly', 'monthly'
    },
    has_capacity: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    max_participants: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    allow_guests: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    max_guests_per_user: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    enable_waitlist: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    auto_promote_waitlist: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requires_confirmation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    event_rules: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    extra_metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'Event',
    tableName: 'events',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['organizer_id'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['start_date'] },
      { fields: ['visibility'] }
    ]
  }
);

module.exports = Event;
