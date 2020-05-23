const mysql = require('mysql')
const util = require('util');
require('dotenv').config()

const connection = ()=>{
    const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
    })
    const query = util.promisify(conn.query).bind(conn);

    return query
}

module.exports = connection()