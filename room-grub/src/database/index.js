import { Sequelize } from 'sequelize';
import User from './models/User.model'
import Room from './models/Room.model'
import pg from 'pg'

const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
        ssl : {
            require: true,
            rejectUnauthorized: false
        }
    },
    dialectModule: pg
});

const Models = {
    User: User(sequelize),
    Room: Room(sequelize)
}

const DB = {
    ...Models,
    sequelize,
    Sequelize,
    sync: (...args) => sequelize.sync(...args),
};

export default DB;