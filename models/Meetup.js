const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Meetup extends Model {}

Meetup.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    organizer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    starting_location: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    starting_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    starting_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    destination: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    meetup_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    meetup_time: {
      type: DataTypes.STRING(20),
      defaultValue: '06:30'
    },
    max_members: {
      type: DataTypes.INTEGER,
      defaultValue: 20
    },
    transport_type: {
      type: DataTypes.ENUM(
        'walking',
        'car',
        'bike',
        'bus',
        'train',
        'flight',
        'public_transport',
        'other'
      ),
      defaultValue: 'car'
    },
    status: {
      type: DataTypes.ENUM('active', 'full', 'cancelled', 'completed'),
      defaultValue: 'active'
    },
    requires_approval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'Meetup',
    tableName: 'meetups',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['event_id'] },
      { fields: ['organizer_id'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = Meetup;
