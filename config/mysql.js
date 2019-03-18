const mysql = require('mysql');
const keys = require('./keys');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : keys.mysql.user,
    password : keys.mysql.password,
    database : 'users'
});

db.connect((err) => {
    if(err){
        throw err;
    }
});

module.exports = db;
