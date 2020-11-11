require('dotenv').config({path: 'variables.env'});

module.exports = {
    database:{
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NOMBRE
    }
};