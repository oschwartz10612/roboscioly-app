const router = require('express').Router();
const express = require('express');
const mysql = require('../config/mysql');
const nodemailer = require('nodemailer');

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

const mainEndCheck = function(req, res, next) {
  if (global.mainAppView == 'yes') {
    res.redirect('/timesup');
  }
  else {
    next();
  }
};

const officerEndCheck = function(req, res, next) {
  if (global.officerAppView == 'yes') {
    res.redirect('/timesup');
  }
  else {
    next();
  }
};

router.get('/apply', authCheck, endCheck, mainEndCheck, function(req, res) {

  let sql = 'SELECT * FROM teachers WHERE department = ?; SELECT * FROM teachers WHERE department = ?';
  mysql.query(sql, ["math","science"], (err, result) => {  
    if (err) {
      res.json({error : "SQL Error", status : 500});
    }
    var mathTeachers = result[0];
    var scienceTeachers = result[1];

    let sql = 'SELECT * FROM team WHERE user_id = ?';
    mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) {
        res.json({error : "SQL Error", status : 500});
      }
        if (result[0] != null) {
          var data = result[0];
          delete data.user_id;

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

        } else {
          res.render('pages/application', {
            user: req.user,
            app: true,
            mathTeachers: mathTeachers,
            scienceTeachers: scienceTeachers
          });
        }
      });
  });
});

router.get('/recommendations', authCheck, function(req, res) {
  if (req.user.role == 'teacher') {
    let sql = 'SELECT * FROM team WHERE math_teacher = ? OR science_teacher = ?; SELECT * FROM officers WHERE math_teacher = ? OR science_teacher = ?';
    mysql.query(sql, [req.user.email, req.user.email, req.user.email, req.user.email], (err, result) => {
      if (err) {
        res.json({error : "SQL Error", status : 500});
      }
      if (result[0] != null) {
            res.render('pages/recommendations', {
              data: result[0].concat(result[1]),
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

router.get('/officer', authCheck, endCheck, officerEndCheck, function(req, res) {
  var error = false;

  let sql = 'SELECT * FROM teachers WHERE department = ?; SELECT * FROM teachers WHERE department = ?';
  mysql.query(sql, ["math","science"], (err, result) => {  
    if (err) {
      console.log(err);
      error = true;
    }
    var mathTeachers = result[0];
    var scienceTeachers = result[1];

    let sql = 'SELECT * FROM officers WHERE user_id = ?';
    mysql.query(sql, req.user.user_id, (err, result) => {
      if (err) {
        console.log(err);
        error = true;
      }
        if (result[0] != null) {
          var data = result[0];
          delete data.user_id;

            if (data.final == "final") {
              res.render('pages/submitted', {
                user: req.user
              });
            } else {
            res.render('pages/officer', {
              user: req.user,
              data: data,
              officer: true,
              mathTeachers: mathTeachers,
              scienceTeachers: scienceTeachers
            });
          }
        } else {
          res.render('pages/officer', {
            user: req.user,
            officer: true,
            mathTeachers: mathTeachers,
            scienceTeachers: scienceTeachers
          });
      }
    });
  });
  if (error) {
    res.json({error : "SQL Error", status : 500});
  }
});

router.post('/form', express.urlencoded({ extended: true }), function(req, res) {
  var error = false;
  const table = req.body.table;
  delete req.body.table;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  let sql = 'SELECT * FROM ' + table + ' WHERE user_id = ?';
  mysql.query(sql, req.user.user_id, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
  if (result[0] != null) {

    let sql = 'UPDATE ' + table + ' SET ';
    for (var i = 0; i < keys.length - 1; i++) {
      sql = sql + keys[i] + ' = ?, '
    }
    sql = sql + keys[keys.length-1] + ' = ? WHERE user_id = ?';

    var data = values;
    data.push(req.user.user_id);

    mysql.query(sql, data, (err) => {
      if (err) {
        console.log(err);
        error = true;
      }
    });
  } else {

    //new submittion
    let submittion = req.body;
    submittion.user_id = req.user.user_id;

    let sql = 'INSERT INTO ' + table + ' SET ?';
    mysql.query(sql, submittion, (err) => {
      if (err) {
        console.log(err);
        error = true;
      }
    });
  }
  });

  if (req.body.final == 'final') {
    const keys = require('../keys.js');
    
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
             user: keys.email.user,
             pass: keys.email.pass
         }
    });

    var recipient;
    if (req.body.math_teacher != 'None') {
      recipient = req.body.math_teacher.split('@')[0] + '@fcps.edu';
    } else if(req.body.science_teacher != 'None') {
      recipient = req.body.science_teacher.split('@')[0] + '@fcps.edu';
    } else {
      recipient = 'apply@roboscienceolympiad.org';
    }
    
    const mailOptions = {
      from: {
        name: 'Science Olympiad Recommendations',
        address: 'apply@roboscienceolympiad.org'
      },
      to: recipient,
      subject: req.body.name + ' Has Requested a Recommendation',
      html: 
      `<p>Hello,</p>
      <p>This is a notification that ${req.body.name} has requested a Science Olympiad recommendation from you.</p>
      <p>When it is a convenient time, please complete this brief form at <a href="apply.roboscienceolympiad.org">apply.roboscienceolympiad.org</a>.&nbsp;<strong> Log in with your fcpsschools.net email address.</strong>&nbsp;</p>
      <p>Regards,</p>
      <p>The Science Olympiad Team</p>`
    };
  
    transporter.sendMail(mailOptions, function (err, info) {
      if(err) console.log(err);
      if (info) console.log(info);
    });
  }

  if (error) {
    res.json({error : "SQL Error", status : 500});
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

router.post('/rec_form', express.urlencoded({ extended: true }), function(req, res) {
  var error = false;
  const table = req.body.table;
  const student_id = req.body.student_id;
  delete req.body.table;
  delete req.body.student_id;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  let sql = 'SELECT * FROM ' + table + ' WHERE user_id = ?';
  mysql.query(sql, student_id, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
  if (result[0] != null) {

    let sql = 'UPDATE ' + table + ' SET ';
    for (var i = 0; i < keys.length - 1; i++) {
      sql = sql + keys[i] + ' = ?, '
    }
    sql = sql + keys[keys.length-1] + ' = ? WHERE user_id = ?';

    var data = values;
    data.push(student_id);

    mysql.query(sql, data, (err) => {
      if (err) {
        console.log(err);
        error = true;
      }
    });
  } else {

    //new submittion
    let submittion = req.body;
    submittion.user_id = student_id;

    let sql = 'INSERT INTO ' + table + ' SET ?';
    mysql.query(sql, submittion, (err) => {
      if (err) {
        console.log(err);
        error = true;
      }
    });
  }
  });
  if (error) {
    res.json({error : "SQL Error", status : 500});
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

module.exports = router;
