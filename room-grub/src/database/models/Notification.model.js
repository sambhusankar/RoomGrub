const { DataTypes } = require('sequelize');

const Notification = (sequelize) => {
  const NotificationModel = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    room_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rooms',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    triggered_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    activity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['payment', 'grocery', 'expense', 'member_join', 'member_leave']]
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'notifications',
    timestamps: false,
    indexes: [
      {
        fields: ['room_id', 'created_at']
      },
      {
        fields: ['activity_type']
      }
    ]
  });

  NotificationModel.associate = (models) => {
    NotificationModel.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
    NotificationModel.belongsTo(models.User, {
      foreignKey: 'triggered_by',
      as: 'triggeredBy'
    });
  };

  return NotificationModel;
};

module.exports = Notification;