function SearchVariableRepository() {

  this.findVariablesLikeName = function (variableName) {
    return new Promise(function (resolve, reject) {
      databaseConnection.getConnection(function (err, connection) {
        let sql = `
          select var.id, var.name, var.value, var.type, var.scope
            from variable var
           where var.name like ?
        `;

        let variable_name = `%${variableName}%`;

        try {
          connection.query(sql, [variable_name], function (err, results) {
            connection.release()
            if (err) {
              reject(err)
            }
            resolve(results)
          })
        } catch (err) {
          connection.release();
          reject(err);
        }
      })
    })
  }


}

module.exports = SearchVariableRepository