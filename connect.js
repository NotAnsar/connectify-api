const mysql = require('mysql');

// const db = mysql.createConnection({
// 	host: process.env.DB_host,
// 	port: process.env.DB_port,
// 	user: process.env.DB_user,
// 	password: process.env.DB_password,
// 	database: process.env.DB_database,
// });

// db.connect(function (err) {
// 	if (err) throw err;
// 	console.log('Connected!');
// });

const db_config = {
	host: process.env.DB_host,
	port: process.env.DB_port,
	user: process.env.DB_user,
	password: process.env.DB_password,
	database: process.env.DB_database,
};

let db;

function handleDisconnect() {
	db = mysql.createConnection(db_config);

	db.connect((err) => {
		if (err) {
			console.log('Error when connecting to db:', err);
			setTimeout(handleDisconnect, 2000);
		}
		console.log('Connected!');
	});

	db.on('error', (err) => {
		console.log('DB error:', err);
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

handleDisconnect();

module.exports = db;
