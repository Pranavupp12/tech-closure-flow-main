// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Newpass12',
  database: 'usersdb'
});

module.exports = pool.promise();
