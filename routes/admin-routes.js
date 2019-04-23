const router = require('express').Router();
const express = require('express');
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
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
    if (err) throw err;
    if (result[0] != null) {
      var payload = {
        user: req.user,
        team: result,
        submissions: true
      }
      let sql = `SELECT * FROM officers`;
      let query = mysql.query(sql, req.user.user_id, (err, result) => {
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

module.exports = router;
