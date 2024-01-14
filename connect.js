const mysql = require('mysql');

const db = mysql.createConnection({
	host: process.env.DB_host,
	port: process.env.DB_port,
	user: process.env.DB_user,
	password: process.env.DB_password,
	database: process.env.DB_database,
});

// Handle connection errors
db.connect(function (err) {
	if (err) {
		console.error('Error connecting to the database:', err.message);
		throw err;
	}

	console.log('Connected to the database!');

	// Periodically ping the server to keep the connection active
	setInterval(() => {
		db.query('SELECT 1', (pingErr) => {
			if (pingErr) {
				console.error('Error pinging the server:', pingErr.message);
			} else {
				console.log('Server pinged successfully.');
			}
		});
	}, 60000); // Pinging the server every 60 seconds
});

// Handle database errors
db.on('error', (err) => {
	console.error('Database error:', err);

	if (err.code === 'PROTOCOL_CONNECTION_LOST') {
		console.log('Attempting to reconnect to the database...');
		// Reconnect to the database
		db.connect();
	} else {
		throw err;
	}
});

module.exports = db;

// const mysql = require('mysql');

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

// module.exports = db;

// const db_config = {
// 	host: process.env.DB_host,
// 	port: process.env.DB_port,
// 	user: process.env.DB_user,
// 	password: process.env.DB_password,
// 	database: process.env.DB_database,
// };

// let db;

// function handleDisconnect() {
// 	db = mysql.createConnection(db_config);

// 	db.connect((err) => {
// 		if (err) {
// 			console.log('Error when connecting to db:', err);
// 			setTimeout(handleDisconnect, 2000);
// 		}
// 		console.log('Connected!');
// 	});

// 	db.on('error', (err) => {
// 		console.log('DB error:', err);
// 		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
// 			handleDisconnect();
// 		} else {
// 			throw err;
// 		}
// 	});
// }

// handleDisconnect();

// module.exports = db;
