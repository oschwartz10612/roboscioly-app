const router = require('express').Router();
const express = require('express');
const mysql = require('../config/mysql');
const tabel = 'data';


const authCheck = function(req, res, next) {
  if (!req.user) {
    res.redirect('/home?login=y');
  } else {
    next();
  }
};

router.get('/', authCheck, function(req, res) {
  let sql = 'SELECT * FROM ' + tabel + ' WHERE user_id = ?';
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

router.post('/form', express.urlencoded({ extended: true }), function(req, res) {
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update tabel
  let sql = 'SELECT * FROM ' + tabel + ' WHERE user_id = ?';
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
  if (err) throw err;
  if (result[0] != null) {

    let sql = 'UPDATE ' + tabel + ' SET ';
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
    submittion.name = req.user.name;

    let sql = 'INSERT INTO ' + tabel + ' SET ?';
    let query = mysql.query(sql, submittion, (err, result) => {
      if (err) throw err;
    });
  }
  });
  res.redirect('back');
});

module.exports = router;
