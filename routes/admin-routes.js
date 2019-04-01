const router = require('express').Router();
const express = require('express');
const mysql = require('../config/mysql');

const authCheck = function(req, res, next) {
  if (!req.user) {
    res.redirect('/home?login=y');
  } else if (req.user.role == 'admin') {
    next();
  }
  else {
    res.redirect('/profile');
  }
};

router.get('/', authCheck, function(req, res) {
  let sql = `SELECT * FROM data`;
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) throw err;
      if (result[0] != null) {
        res.render('pages/admin', {user: req.user, data: result[0]});
      }
    });
});

module.exports = router;
