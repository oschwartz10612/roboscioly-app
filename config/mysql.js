const mysql = require('mysql');
const keys = require('./keys');

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
  };

  if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }

const db = mysql.createConnection(config);

db.connect((err) => {
    if(err){
        throw err;
    }
});

module.exports = db;
