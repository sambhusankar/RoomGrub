import { DataTypes } from 'sequelize';

export default function(sequelize) {
    return sequelize.define('PushSubscription', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Rooms',
                key: 'id'
            }
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
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    }, {
        schema: "public",
        tableName: "push_subscriptions",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'room_id'],
                name: 'unique_user_room_subscription'
            }
        ]
    });
}