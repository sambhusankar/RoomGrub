import { DataTypes } from 'sequelize';

export default function(sequelize) {
    return sequelize.define('Balance', {
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
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('credit', 'debit'),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        schema: "public",
        tableName: "balance",
        timestamps: false
    });
}