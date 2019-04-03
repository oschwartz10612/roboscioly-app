const express = require('express');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const adminRoutes = require('./routes/admin-routes');
const passportSetup = require('./config/passport-setup');
const cookieSession = require('cookie-session');
const keys = require('./config/keys')
const passport = require('passport');

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
  if (req.query.login == 'y') {
    res.render('pages/index', {user: req.user, modal: true});
  } else {
    res.render('pages/index', {user: req.user, modal: false});
  }
});

app.get('/', function(req, res) {
  res.redirect('/home');
});

app.post('/login', function(req, res) {
    res.render('pages/index', {user: req.user});
    console.log(req.body.email);
    console.log(req.body.pass);
});

app.listen(process.env.PORT);
