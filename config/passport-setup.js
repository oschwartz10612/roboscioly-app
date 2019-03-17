const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const mysql = require('mysql');
const uuidv4 = require('uuid/v4');

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'users'
});

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...');
});

passport.serializeUser(function (user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
  let sql = `SELECT * FROM google WHERE user_id = ?`;
  let query = db.query(sql, id, (err, result) => {
      if(err) throw err;
      done(null, result[0]);
  });
});

passport.use(
  new GoogleStrategy({
    callbackURL: '/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
}, function (accsessToken, refreshToken, profile, done) {
    let sql = `SELECT * FROM google WHERE google_id = ${profile.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        if (result[0] != null) {
          console.log("Existing User:");
          console.log(result);
          done(null, result[0]);
        }
        else {
          let user = {google_id: profile.id, name: profile.displayName, user_id: uuidv4()};
          let sql = 'INSERT INTO google SET ?';
          let query = db.query(sql, user, (err, result) => {
              if(err) throw err;
              console.log("user added...");
              let sql = `SELECT * FROM google WHERE google_id = ${profile.id}`;
              let query = db.query(sql, (err, result) => {
                  if(err) throw err;
                  console.log(result);
                  if (result[0] != null) {
                    console.log("same");
                    done(null, result[0]);
                  }
                });
          });
        }
    });
  })
);
