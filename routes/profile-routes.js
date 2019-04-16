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
          data: data,
          app: true
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
    let query = mysql.query(sql, [req.user.name, req.user.name], (err, result) => {
      if (result[0] != null) {

        var students = result;
        let sql = 'SELECT * FROM recs WHERE ';
        for (var i = 0; i < students.length; i++) {
          if (students.length-1 == i) {
            sql = sql + ' student_id = "' + students[i].user_id + '"';
          }
          else {
            sql = sql + ' student_id = "' + students[i].user_id + '" OR';
          }
        }

        let query = mysql.query(sql, (err, result) => {
          if (result[0] != null) {
            res.render('pages/recommendations', {
              students: students,
              data: result,
              user: req.user,
              rec: true
            });
          }
          else {
            res.render('pages/recommendations', {
              students: students,
              data: [],
              user: req.user,
              rec: true
            });
          }
        });
      } else {
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

router.get('/officer', authCheck, function(req, res) {
  let sql = 'SELECT * FROM officers WHERE user_id = ?';
  let query = mysql.query(sql, req.user.user_id, (err, result) => {
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

router.post('/rec_form', express.urlencoded({ extended: true }), function(req, res) {
  const table = req.body.table;
  delete req.body.table;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  let sql = 'SELECT * FROM ' + table + ' WHERE student_id = ?';
  let query = mysql.query(sql, req.body.student_id, (err, result) => {
  if (err) throw err;
  if (result[0] != null) {

    let sql = 'UPDATE ' + table + ' SET ';
    for (var i = 0; i < keys.length - 2; i++) {
      sql = sql + keys[i] + ' = ?, '
    }
    sql = sql + keys[keys.length-2] + ' = ? WHERE student_id = ?';

    var data = values;
    data.splice(-1,1);
    data.push(req.body.student_id);

    let query = mysql.query(sql, data, (err, result) => {
      if (err) throw err;
    });
  } else {

    //new submittion
    let submittion = req.body;
    delete submittion[keys[keys.length-1]];
    submittion.student_id = req.body.student_id;

    let sql = 'INSERT INTO ' + table + ' SET ?';
    let query = mysql.query(sql, submittion, (err, result) => {
      if (err) throw err;
    });
  }
  });
  res.redirect('back');
});

module.exports = router;
