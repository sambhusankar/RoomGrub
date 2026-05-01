import { DataTypes } from 'sequelize'

module.exports = function(sequelize) {
    return sequelize.define('UserRoom', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' }
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Rooms', key: 'id' }
        },
        role: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: 'Member'
        },
        joined_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        schema: 'public',
        tableName: 'UserRooms',
        timestamps: false
    })
}
