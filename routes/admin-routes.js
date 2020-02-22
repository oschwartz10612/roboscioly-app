const router = require('express').Router();
const mysql = require('../config/mysql');
const express = require('express');

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
  var error = false;
  let sql = `SELECT * FROM team`;
  mysql.query(sql, req.user.user_id, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
    if (result[0] != null) {
      var payload = {
        user: req.user,
        team: result,
        submissions: true
      }
      let sql = `SELECT * FROM officers`;
      mysql.query(sql, req.user.user_id, (err, result) => {
        if (err) {
        }
        if (result[0] != null) {
          payload.officers = result;
        }
        res.render('pages/admin', payload);
      });
    } else {
      res.render('pages/admin', {user: req.user, submissions: true});
    }
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  }
});

router.get('/api/alldata', authCheck, function(req, res) {
  var error = false;
  let sql = `SELECT * FROM team`;
  mysql.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
    if (result[0] != null) {
      var resultJson = JSON.stringify(result);
      resultJson = JSON.parse(resultJson);

      res.send(resultJson);
    }
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  }
});

router.get('/api/allofficerdata', authCheck, function(req, res) {
  var error = false;
  let sql = `SELECT * FROM officers`;
  mysql.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
    if (result[0] != null) {
      var resultJson = JSON.stringify(result);
      resultJson = JSON.parse(resultJson);

      res.send(resultJson);
    }
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  }
});

router.get('/api/teacher_data', authCheck, function(req, res) {
  var error = false;
  let sql = `SELECT * FROM teachers`;
  mysql.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
    if (result[0] != null) {
      var resultJson = JSON.stringify(result);
      resultJson = JSON.parse(resultJson);

      res.send(resultJson);
    }
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  }
});

router.get('/api/getcolumns', authCheck, function(req, res) {
  var error = false;
  let sql = `SELECT column_name FROM information_schema.columns WHERE table_schema = 'apps' AND table_name = 'team'`;
  mysql.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
    if (result[0] != null) {
      var resultJson = JSON.stringify(result);
      resultJson = JSON.parse(resultJson);

      res.send(resultJson);
    }
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  }
});

router.get('/api/getofficercolumns', authCheck, function(req, res) {
  var error = false;
  let sql = `SELECT column_name FROM information_schema.columns WHERE table_schema = 'apps' AND table_name = 'officers'`;
  mysql.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      error = true;
    }
    if (result[0] != null) {
      var resultJson = JSON.stringify(result);
      resultJson = JSON.parse(resultJson);

      res.send(resultJson);
    }
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  }
});

router.get('/api/closeApp', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'yes' WHERE name = 'application'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.END = 'yes';
  res.send('done');
});

router.get('/api/openApp', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'no' WHERE name = 'application'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.END = 'no';
  res.send('done');
});

router.get('/api/closeMain', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'yes' WHERE name = 'mainAppView'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.mainAppView = 'yes';
  res.send('done');
});

router.get('/api/openMain', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'no' WHERE name = 'mainAppView'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.mainAppView = 'no';
  res.send('done');
});

router.get('/api/closeOfficer', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'yes' WHERE name = 'officerAppView'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.officerAppView = 'yes';
  res.send('done');
});

router.get('/api/openOfficer', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'no' WHERE name = 'officerAppView'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.officerAppView = 'no';
  res.send('done');
});

router.get('/api/closeCollectEmail', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'no' WHERE name = 'collectEmail'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.collectEmail = 'no';
  res.send('done');
});

router.get('/api/openCollectEmail', authCheck, function(req, res) {
  let sql = `UPDATE variables SET state = 'yes' WHERE name = 'collectEmail'`;
  mysql.query(sql, (err) => { if (err) throw err; });
  global.collectEmail = 'yes';
  res.send('done');
});

router.post('/api/update_sql', authCheck, express.urlencoded({ extended: true }), function(req, res) {
  var error = false;
  const table = "team";
  const user_id = req.body.user_id;
  delete req.body.user_id;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  let sql = 'SELECT * FROM ' + table + ' WHERE user_id = ?';
  mysql.query(sql, user_id, (err, result) => {
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
      data.push(user_id);

      mysql.query(sql, data, (err) => {
        if (err) {
          console.log(err);
          error = true;
        }
      });
    } else {

      //new submittion
      let submittion = req.body;
      submittion.user_id = user_id;

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
    res.status(500).send({error: 'There was an error!'}); 
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

router.post('/api/update_officer_sql', authCheck, express.urlencoded({ extended: true }), function(req, res) {
  var error = false;
  const table = "officers";
  const user_id = req.body.user_id;
  delete req.body.user_id;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  let sql = 'SELECT * FROM ' + table + ' WHERE user_id = ?';
  mysql.query(sql, user_id, (err, result) => {
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
      data.push(user_id);

      mysql.query(sql, data, (err) => {
        if (err) {
          console.log(err);
          error = true;
        }
      });
    } else {

      //new submittion
      let submittion = req.body;
      submittion.user_id = user_id;

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
    res.status(500).send({error: 'There was an error!'}); 
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

router.post('/api/update_sql_teachers', authCheck, express.urlencoded({ extended: true }), function(req, res) {
  var error = false;
  const table = "teachers";
  const id = req.body.id;
  delete req.body.id;
  const values = Object.values(req.body);
  const keys = Object.keys(req.body);

  //Update table
  if (id !== "new") {

  let sql = 'SELECT * FROM ' + table + ' WHERE ID = ?';
  mysql.query(sql, id, (err) => {
    if (err) {
      console.log(err);
      error = true;
    }

    let sql = 'UPDATE ' + table + ' SET ';
    for (var i = 0; i < keys.length - 1; i++) {
      sql = sql + keys[i] + ' = ?, '
    }
    sql = sql + keys[keys.length-1] + ' = ? WHERE ID = ?';

    var data = values;
    data.push(id);

    mysql.query(sql, data, (err) => {
      if (err) {
        console.log(err);
        error = true;
      }
    });
  });

  } else {

    //new submittion
    let submittion = req.body;
    let sql = 'INSERT INTO ' + table + ' SET ?';
    mysql.query(sql, submittion, (err, result) => {
      if (err) {
        console.log(err);
        error = true;
      }
    });
  }
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

router.post('/api/deleteTeachers', authCheck, express.urlencoded({ extended: true }), function(req, res) {
  const table = "teachers";
  var error = false;
  
  req.body.ids.forEach(id => {
    let sql = 'DELETE FROM ' + table + ' WHERE ID = ?';
    mysql.query(sql, id, (err) => {
      if(err) {
        console.log(err);
        error = true;
      }
    });
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

router.post('/api/deleteOfficers', authCheck, express.urlencoded({ extended: true }), function(req, res) {
  const table = "officers";
  var error = false;
  
  req.body.ids.forEach(id => {
    let sql = 'DELETE FROM ' + table + ' WHERE user_id = ?';
    mysql.query(sql, id, (err) => {
      if(err) {
        console.log(err);
        error = true;
      }
    });
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

router.post('/api/deleteTeam', authCheck, express.urlencoded({ extended: true }), function(req, res) {
  const table = "team";
  var error = false;

  req.body.ids.forEach(id => {
    let sql = 'DELETE FROM ' + table + ' WHERE user_id = ?';
    mysql.query(sql, id, (err) => {
      if(err) {
        console.log(err);
        error = true;
      }
    });
  });
  if (error) {
    res.status(500).send({error: 'There was an error!'}); 
  } else {
    res.json({success : "Updated Successfully", status : 200});
  }
});

module.exports = router;