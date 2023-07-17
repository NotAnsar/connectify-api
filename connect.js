const mysql = require('mysql');

const db = mysql.createConnection({
	host: process.env.DB_host,
	port: process.env.DB_port,
	user: process.env.DB_user,
	password: process.env.DB_password,
	database: process.env.DB_database,
});

db.connect(function (err) {
	if (err) throw err;
	console.log(process.env.DB_host);
	console.log('Connected!');
});

module.exports = db;
