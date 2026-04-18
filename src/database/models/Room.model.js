import { DataTypes } from 'sequelize';

export default function(sequelize) {
    return sequelize.define('Room', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        members: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        budget: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        admin: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        uid: {
            type: DataTypes.UUID,
            allowNull: true
        }
    }, {
        schema: "public",
        tableName: "Rooms",
        timestamps: false
    });
}