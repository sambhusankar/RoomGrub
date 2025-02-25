import { timeStamp } from 'console'
import {DataTypes} from 'sequelize'
const crypto = require('crypto')

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
            defaultValue: () => crypto.randomUUID()
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, 
    {
        shcema: "public",
        tableName: "Users",
        timestamps:false
    }
)
}