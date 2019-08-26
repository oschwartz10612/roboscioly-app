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

const endCheck = function(req, res, next) {
  if (global.END == 'yes') {
    res.redirect('/timesup');
  }
  else {
    next();
  }
};

router.get('/apply', authCheck, endCheck, function(req, res) {
  let sql = 'SELECT * FROM team WHERE user_id = ?';
  mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) throw err;
      if (result[0] != null) {
        var data = result[0];
        delete data.user_id;

        let sql = 'SELECT * FROM teachers WHERE department = ?; SELECT * FROM teachers WHERE department = ?';
        mysql.query(sql, ["math","science"], (err, result) => {  
          if (err) throw err;
          var mathTeachers = result[0];
          var scienceTeachers = result[1];

          if (data.final == "final") {
            res.render('pages/submitted', {
              user: req.user
            });
          } else { 
            res.render('pages/application', {
              user: req.user,
              data: data,
              mathTeachers: mathTeachers,
              scienceTeachers: scienceTeachers,
              app: true
            });
          }
        });
      } else {
        res.render('pages/application', {
          user: req.user,
          app: true
        });
      }
    });
});

router.get('/recommendations', authCheck, function(req, res) {
  if (req.user.role == 'teacher') {
    let sql = 'SELECT * FROM team WHERE math_teacher = ? OR science_teacher = ?';
    mysql.query(sql, [req.user.email, req.user.email], (err, result) => {
      if (result[0] != null) {
            res.render('pages/recommendations', {
              data: result,
              user: req.user,
              rec: true
            });
          }
          else {
            res.render('pages/recommendations', {
              user: req.user,
              rec: true
            });
          }
        });
      } else {
    res.redirect('/home');
  }
});

router.get('/officer', authCheck, endCheck, function(req, res) {
  let sql = 'SELECT * FROM officers WHERE user_id = ?';
  mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) throw err;
      if (result[0] != null) {
        var data = result[0];
        delete data.user_id;

        res.render('pages/officer', {
          user: req.user,
          data: data,
          officer: true
        });
      } else {
        res.render('pages/officer', {
          user: req.user,
          officer: true
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
  mysql.query(sql, req.user.user_id, (err, result) => {
  if (err) throw err;
  if (result[0] != null) {

    let sql = 'UPDATE ' + table + ' SET ';
    for (var i = 0; i < keys.length - 1; i++) {
      sql = sql + keys[i] + ' = ?, '
    }
    sql = sql + keys[keys.length-1] + ' = ? WHERE user_id = ?';

    var data = values;
    data.push(req.user.user_id);

    mysql.query(sql, data, (err) => {
      if (err) throw err;
    });
  } else {

    //new submittion
    let submittion = req.body;
    submittion.user_id = req.user.user_id;

    let sql = 'INSERT INTO ' + table + ' SET ?';
    mysql.query(sql, submittion, (err) => {
      if (err) throw err;
    });
  }
  });
    res.json({success : "Updated Successfully", status : 200});
});

router.post('/rec_form', express.urlencoded({ extended: true }), function(req, res) {
  const table = req.body.table;
  const student_id = req.body.student_id;
  delete req.body.table;
  delete req.body.student_id;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  let sql = 'SELECT * FROM ' + table + ' WHERE user_id = ?';
  mysql.query(sql, student_id, (err, result) => {
  if (err) throw err;
  if (result[0] != null) {

    let sql = 'UPDATE ' + table + ' SET ';
    for (var i = 0; i < keys.length - 1; i++) {
      sql = sql + keys[i] + ' = ?, '
    }
    sql = sql + keys[keys.length-1] + ' = ? WHERE user_id = ?';

    var data = values;
    data.push(student_id);

    mysql.query(sql, data, (err) => {
      if (err) throw err;
    });
  } else {

    //new submittion
    let submittion = req.body;
    submittion.user_id = student_id;

    let sql = 'INSERT INTO ' + table + ' SET ?';
    mysql.query(sql, submittion, (err) => {
      if (err) throw err;
    });
  }
  });
    res.json({success : "Updated Successfully", status : 200});
});

module.exports = router;
