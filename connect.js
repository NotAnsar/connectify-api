const mysql = require('mysql');

const db = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user: 'root',
	password: '',
	database: 'connectify',
});

db.connect(function (err) {
	if (err) throw err;
	console.log('Connected!');
});

module.exports = db;
