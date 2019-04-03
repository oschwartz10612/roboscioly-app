const router = require('express').Router();
const express = require('express');
const mysql = require('../config/mysql');

const authCheck = function(req, res, next) {
  if (!req.user) {
    res.redirect('/home?login=y');
  } else {
    next();
  }
};

router.get('/apply', authCheck, function(req, res) {
  let sql = 'SELECT * FROM team WHERE user_id = ?';
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) throw err;
      if (result[0] != null) {
        var data = result[0];
        delete data.user_id;

        res.render('pages/application', {
          user: req.user,
          data: data
        });
      } else {
        res.render('pages/application', {
          user: req.user
        });
    }
  });
});

router.get('/officer', authCheck, function(req, res) {
  let sql = 'SELECT * FROM officers WHERE user_id = ?';
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) throw err;
      if (result[0] != null) {
        var data = result[0];
        delete data.user_id;

        res.render('pages/officer', {
          user: req.user,
          data: data
        });
      } else {
        res.render('pages/officer', {
          user: req.user
        });
    }
  });
});

router.post('/form', express.urlencoded({ extended: true }), function(req, res) {
  const table = req.body.table;
  delete req.body.table;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  let sql = 'SELECT * FROM ' + table + ' WHERE user_id = ?';
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
  if (err) throw err;
  if (result[0] != null) {

    let sql = 'UPDATE ' + table + ' SET ';
    for (var i = 0; i < keys.length - 2; i++) {
      sql = sql + keys[i] + ' = ?, '
    }
    sql = sql + keys[keys.length-2] + ' = ? WHERE user_id = ?';

    var data = values;
    data.splice(-1,1);
    data.push(req.user.user_id);

    let query = mysql.query(sql, data, (err, result) => {
      if (err) throw err;
    });
  } else {

    //new submittion
    let submittion = req.body;
    delete submittion[keys[keys.length-1]];
    submittion.user_id = req.user.user_id;

    let sql = 'INSERT INTO ' + table + ' SET ?';
    let query = mysql.query(sql, submittion, (err, result) => {
      if (err) throw err;
    });
  }
  });
  res.redirect('back');
});

module.exports = router;
