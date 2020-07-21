function AuthenticationRepository() {

  this.findOneByUser = function(user, callback) {
    databaseConnection.getConnection(function(err, connection) {
      connection.query('select * from authentication where user = ?', [user], function(err, rows) {
        if (err) {
          callback(err, null);
        }

        if (rows.length == 0) {
          callback("Zero rows were founded for this user:" + user, null);
        } else if (rows.length > 1) {
          callback("More than one row was found for user:" + user, null);
        }else {
          callback(null, rows[0]);
        }
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
        var sql = `UPDATE authentication
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

        var sql = `INSERT INTO authentication
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
}

module.exports = AuthenticationRepository;
