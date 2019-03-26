const router = require('express').Router();
const express = require('express');
const mysql = require('../config/mysql');

const authCheck = function(req, res, next) {
  if (!req.user) {
    res.redirect('/auth/login');
  } else {
    next();
  }
};

router.get('/', authCheck, function(req, res) {
  let sql = `SELECT * FROM data1 WHERE user_id = ?`;
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) throw err;
      if (result[0] != null) {
        res.render('pages/profile', {
          user: req.user,
          data: {
            text: result[0].text,
            textarea: result[0].textarea,
            dropdown: result[0].dropdown
          }
        });
      } else {
        res.render('pages/profile', {
          user: req.user,
          data: {
            text: null,
            textarea: null,
            dropdown: null
          }
        });
    }
  });
});

router.post('/form', express.urlencoded({ extended: true }), function(req, res) {
  let sql = `SELECT * FROM data1 WHERE user_id = ?`;
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
  if (err) throw err;
  if (result[0] != null) {
    let sql = `UPDATE data1 SET text = ?, textarea = ?, dropdown = ? WHERE user_id = ?`;
    let query = mysql.query(sql, [req.body.text, req.body.textarea, req.body.select, req.user.user_id], (err, result) => {
      if (err) throw err;
    });
  } else {
    let data = {
      user_id: req.user.user_id,
      name: req.user.name,
      text: req.body.text,
      textarea: req.body.textarea,
      dropdown: req.body.select
    };
    let sql = 'INSERT INTO data1 SET ?';
    let query = mysql.query(sql, data, (err, result) => {
      if (err) throw err;
    });
  }
  });
  res.redirect('back');
});

module.exports = router;
