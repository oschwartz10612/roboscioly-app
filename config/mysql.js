const mysql = require('mysql');
const keys = require('./keys');

const db = mysql.createConnection({
    host     : '35.227.22.203',
    user     : keys.mysql.user,
    password : keys.mysql.password,
    database : 'apps'
});

db.connect((err) => {
    if(err){
        throw err;
    }
});

module.exports = db;
