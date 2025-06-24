import { DataTypes } from 'sequelize';

export default function(sequelize) {
    return sequelize.define('Spendings', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        room: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Rooms',
                key: 'id'
            }
        },
        user: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        material: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        money: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        schema: "public",
        tableName: "Spendings",
        timestamps: false
    });
}