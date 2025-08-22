import { Sequelize } from 'sequelize';
import User from './models/User.model'
import Room from './models/Room.model'
import Balance from './models/Balance.model'
import Spendings from './models/Spendings.model'
import Invite from './models/Invite.model'
import PushSubscription from './models/PushSubscription.model'
import Notification from './models/Notification.model'
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
    Room: Room(sequelize),
    Balance: Balance(sequelize),
    Spendings: Spendings(sequelize),
    Invite: Invite(sequelize),
    PushSubscription: PushSubscription(sequelize),
    Notification: Notification(sequelize)
}

const DB = {
    ...Models,
    sequelize,
    Sequelize,
    sync: (...args) => sequelize.sync(...args),
};

export default DB;