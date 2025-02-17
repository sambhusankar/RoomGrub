import Sequeilize from 'sequelize'
import pg from 'pg'
import User from './models/User.model'

const sequelize = new Sequeilize(process.env.SUPABASE_DB_URL, {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        },
        dialectModule: pg
    }
})

const models = {
    User: User(sequelize)
}

const db = {
    ...models,
    sequelize,
    Sequeilize,
    sync: (...args) => sequelize.sync(...args)
}

export default db;