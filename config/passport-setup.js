const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const mysql = require('./mysql');
const uuidv4 = require('uuid/v4');

passport.serializeUser(function (user, done) {
  done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
  let sql = `SELECT * FROM google WHERE user_id = ?`;
  let query = mysql.query(sql, id, (err, result) => {
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
    let query = mysql.query(sql, (err, result) => {
        if(err) throw err;
        if (result[0] != null) {
          done(null, result[0]);
        }
        else {
          let user = {google_id: profile.id, name: profile.displayName, user_id: uuidv4()};
          let sql = 'INSERT INTO google SET ?';
          let query = mysql.query(sql, user, (err, result) => {
              if(err) throw err;
              let sql = `SELECT * FROM google WHERE google_id = ${profile.id}`;
              let query = mysql.query(sql, (err, result) => {
                  if(err) throw err;
                  if (result[0] != null) {
                    done(null, result[0]);
                  }
              });
          });
        }
    });
  })
);
