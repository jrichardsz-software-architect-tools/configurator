function ApplicationVariableRepository() {

  this.findOneById = function(id, callback) {
    databaseConnection.getConnection(function(err, connection) {
      connection.query('select * from application_variable where id = ?', [id], function(err, rows) {
        if (err) {
          callback(err, rows);
        }

        if (rows.length == 0) {
          callback("Zero rows were found for id:" + id, null);
        }else if (rows.length > 1) {
          callback("More than one row was found for id:" + id, null);
        } else {
          callback(null, rows[0]);
        }
      });
    });
  }

  this.findVariablesByApplicationId = function(applicationId, callback) {
    databaseConnection.getConnection(function(err, connection) {

      var sql = `select av.id, av.variable_id, v.name, v.value, v.description, v.type, v.scope
                 from application_variable av, variable v
                 where av.application_id = ? and av.variable_id = v.id
                 order by scope`;
      try {
        connection.query(sql, [applicationId], function(err, selectResult) {
          if (err) {
            callback(err, null);
          }
          callback(null, selectResult);
        });
      } catch (connectionErr) {
        callback(connectionErr, null);
      }
    });
  }

  this.findVariablesByApplicationName = function(applicationName, callback) {
    databaseConnection.getConnection(function(err, connection) {

      var sql = `select
                	av.id,
                	av.variable_id,
                	v.name,
                	v.value,
                	v.description,
                	v.type,
                	v.scope
                from
                	application_variable av,
                	variable v,
                	application ap
                where
                	ap.name = ?
                	and av.application_id = ap.id
                	and av.variable_id = v.id`;
      try {
        connection.query(sql, [applicationName], function(err, selectResult) {
          if (err) {
            callback(err, null);
          }
          callback(null, selectResult);
        });
      } catch (connectionErr) {
        callback(connectionErr, null);
      }
    });
  }

  this.findApplicationAndVariableById = function(id, callback) {
    databaseConnection.getConnection(function(err, connection) {
      var sql = `select av.id, a.name as application_name,v.name as variable_name
                 from  application_variable av,application a, variable v
                 where av.id = ? and
                 a.id = av.application_id and
                 v.id = av.variable_id`;
      try {
        connection.query(sql, [id], function(err, rows) {
          if (err) {
            callback(err, rows);
          }
          callback(null, rows);
        });
      } catch (connectionErr) {
        callback(connectionErr, null);
      }
    });
  }

  this.save = function(entity, callback) {
    databaseConnection.getConnection(function(err, connection) {
      if (entity.id) {
        logger.info("Update action")
        var columns = [];
        var params = [];
        for (key in entity) {
          if (entity[key]) {
            if (key != "id") {
              columns.push(key + "=?");
              params.push(entity[key]);
            }
          }
        }

        params.push(entity.id);

        // update statment
        var sql = `UPDATE application
                   SET @columns
                   WHERE id = ?`;

        sql = sql.replace("@columns", columns.toString());
        logger.info(sql);

        connection.query(sql, params, function(errUpdate, result) {
          callback(errUpdate, result);
        });

      } else {
        logger.info("Insert action")
        var values = [];
        var columns = [];
        var jokers = [];
        for (key in entity) {
          if (key != "id") {
            values.push(entity[key]);
            columns.push(key);
            jokers.push("?");
          }
        }

        var sql = `INSERT INTO application_variable
                   (@columns)
                   VALUES(@jokers)`;
        sql = sql.replace("@columns", columns.toString());
        sql = sql.replace("@jokers", jokers.toString());
        logger.info(sql);
        connection.query(sql, values, function(errInsert, result) {
          callback(errInsert, result);
        });
      }
    });
  }
  
  this.massiveSave = function(columns, application_id, variables_id, callback) {
    databaseConnection.getConnection(function(err, connection) {
      logger.info("Massive Insert action")
      
      var values = "";
      
      for(var i=0; i<variables_id.length; i++){
        values += `(${application_id}, ${variables_id[i]})`;          
        if(i<variables_id.length-1){//is the last
          values += ",";    
        }
      }

      var sql = `INSERT INTO application_variable
                 (@columns)
                 VALUES
                 @values`;
      sql = sql.replace("@columns", columns.toString());
      sql = sql.replace("@values", values.toString());
      logger.info(sql);
      connection.query(sql, values, function(errInsert, result) {
        callback(errInsert, result);
      });    
    });
  }  

  this.delete = function(id, callback) {
    var params = [id];

    var sql = `DELETE FROM application_variable
               WHERE id=?`;

    databaseConnection.getConnection(function(conecctionErr, connection) {
      connection.query(sql, params, function(deletionErr, deletionResult) {
        callback(deletionErr, deletionResult);
      });
    });
  }



}


module.exports = ApplicationVariableRepository;
