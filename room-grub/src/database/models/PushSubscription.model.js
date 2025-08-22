const { DataTypes } = require('sequelize');

const PushSubscription = (sequelize) => {
  const PushSubscriptionModel = sequelize.define('PushSubscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    p256dh_key: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    auth_key: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'push_subscriptions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'room_id']
      }
    ]
  });

  PushSubscriptionModel.associate = (models) => {
    PushSubscriptionModel.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    PushSubscriptionModel.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
  };

  return PushSubscriptionModel;
};

module.exports = PushSubscription;