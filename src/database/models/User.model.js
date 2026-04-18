import {DataTypes} from 'sequelize'

module.exports = function(sequelize){
    return sequelize.define('User', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        room: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        uid: {
            type: DataTypes.UUID,
            allowNull: true
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        profile: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, 
    {
        schema: "public",
        tableName: "Users",
        timestamps:false
    }
)
}