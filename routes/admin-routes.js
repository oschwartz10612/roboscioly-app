const router = require('express').Router();
const mysql = require('../config/mysql');

const authCheck = function(req, res, next) {
  if (!req.user) {
    res.redirect('/home?login=y');
  } else if (req.user.role == 'admin') {
    next();
  } else {
    res.redirect('/profile');
  }
};

router.get('/', authCheck, function(req, res) {
  let sql = `SELECT * FROM team`;
  mysql.query(sql, req.user.user_id, (err, result) => {
    if (err) throw err;
    if (result[0] != null) {
      var payload = {
        user: req.user,
        team: result,
        submissions: true
      }
      let sql = `SELECT * FROM officers`;
      mysql.query(sql, req.user.user_id, (err, result) => {
        if (err) throw err;
        if (result[0] != null) {
          payload.officers = result;
        }
        res.render('pages/admin', payload);
      });
    } else {
      res.render('pages/admin', {user: req.user, submissions: true});
    }
  });
});

router.get('/api/alldata', authCheck, function(req, res) {
  let sql = `SELECT * FROM team`;
  mysql.query(sql, (err, result) => {
    if (err) throw err;
    if (result[0] != null) {
      var resultJson = JSON.stringify(result);
      resultJson = JSON.parse(resultJson);

      res.send(resultJson);
    }
  });
});

router.get('/api/getcolumns', authCheck, function(req, res) {
  let sql = `SELECT column_name FROM information_schema.columns WHERE table_schema = 'apps' AND table_name = 'team'`;
  mysql.query(sql, (err, result) => {
    if (err) throw err;
    if (result[0] != null) {
      var resultJson = JSON.stringify(result);
      resultJson = JSON.parse(resultJson);

      res.send(resultJson);
    }
  });
});

router.get('/api/closeApp', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'true' WHERE name = 'application'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.END = true;
  res.send('done');
});

router.get('/api/openApp', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'false' WHERE name = 'application'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.END = false;
  res.send('done');
});

router.get('/api/closeCollectEmail', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'false' WHERE name = 'collectEmail'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.collectEmail = false;
  res.send('done');
});

router.get('/api/openCollectEmail', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'true' WHERE name = 'collectEmail'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.collectEmail = true;
  res.send('done');
});



module.exports = router;
