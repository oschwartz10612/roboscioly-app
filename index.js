const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const adminRoutes = require('./routes/admin-routes');
const passportSetup = require('./config/passport-setup');
const cookieSession = require('cookie-session');
const keys = require('./config/keys')
const passport = require('passport');
const mysql = require('./config/mysql');

const app = express();

app.use(express.static('public'));

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

app.get('/home', function(req, res) {
  res.render('pages/index', {user: req.user, index: true, instructions: true});
});

app.get('/', function(req, res) {
  res.redirect('/home');
});

app.post('/emails', express.urlencoded({ extended: true }), function(req, res) { 
  const table = req.body.table;
  var submittion = {
    name: req.body.name,
    email: req.body.email
  }
  let sql = 'INSERT INTO ' + table + ' SET ?';
  let query = mysql.query(sql, submittion, (err, result) => {
    if (err) throw err;
  });
  res.json({success : "Updated Successfully", status : 200});
});

app.listen(keys.env.port);
