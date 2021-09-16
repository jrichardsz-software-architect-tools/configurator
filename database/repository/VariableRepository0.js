function VariableRepository() {

  this.findOneById = function(id, callback) {
    databaseConnection.getConnection(function(err, connection) {
      connection.query('select * from variable where id = ?', [id], function(err, rows) {
        if (err) {
          callback(err, rows);
        }

        if (rows.length > 1) {
          callback("More than one row was found for id:" + id, null);
        } else {
          callback(null, rows[0]);
        }

      });
    });
  }

  this.findByScopeAndDeleted = function(scope,deleted, callback) {
    var params = [scope,deleted];
    databaseConnection.getConnection(function(err, connection) {
      connection.query('select * from variable where scope = ? and deleted = ?', params, function(err, rows) {
        callback(err, rows);
      });
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
        var sql = `UPDATE variable
                   SET @columns
                   WHERE id = ?`;

        sql = sql.replace("@columns", columns.toString());
        logger.debug(sql);

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

        var sql = `INSERT INTO variable
                   (@columns)
                   VALUES(@jokers)`;
        sql = sql.replace("@columns", columns.toString());
        sql = sql.replace("@jokers", jokers.toString());

        connection.query(sql, values, function(errInsert, result) {
          callback(errInsert, result);
        });
      }
    });
  }

  this.delete = function(id, callback) {
    var params = [id];

    var sql = `DELETE FROM variable
               WHERE id=?`;

    databaseConnection.getConnection(function(conecctionErr, connection) {
      connection.query(sql, params, function(deletionErr, deletionResult) {
        callback(deletionErr, deletionResult);
      });
    });
  }

  /*
  input collection must have the same columns, in the same order
  https://stackoverflow.com/questions/39270007/get-inserted-ids-of-multiple-insert-statements
  https://stackoverflow.com/questions/8899802/how-do-i-do-a-bulk-insert-in-mysql-using-node-js/34503558#34503558
  https://stackoverflow.com/questions/45076191/mysql-bulk-insert-in-node-js-how-to-get-all-insertids
  https://github.com/mysqljs/mysql/issues/1284
  */
  this.bulkInsert = function(columns, variables, callback) {

    var sql = `INSERT into variable (@columns) VALUES ?`;
    sql = sql.replace("@columns", columns.toString());

    databaseConnection.getConnection(function(conecctionErr, connection) {
      connection.query(sql, [variables], function(bulkInsertErr, bulkResult, fields) {
        callback(bulkInsertErr, bulkResult);
      });
    });
  }

  this.findIdsFromNames = function(names, callback) {
    databaseConnection.getConnection(function(err, connection) {
      connection.query('select id from variable where name in (?)', [names], function(err, rows) {
        callback(err, rows);
      });
    });
  }

}

module.exports = VariableRepository;
