require('dotenv').config();

var mysql = require('mysql');
var migration = require('mysql-migrations');

var dbPool = mysql.createPool({
  host     : 'remotemysql.com',
  user     : `${process.env.DB_USERNAME}`,
  password : `${process.env.DB_PASSWORD}`,
  database : '2fIDqKRC00',
  connectionLimit:20
});

migration.init(dbPool, __dirname + '/migrations');