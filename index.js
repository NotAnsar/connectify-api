const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();

app.use('/images', express.static(path.join(__dirname, 'images')));

const corsOptions = {
	origin: process.env.CLIENT_APP_URL,
	credentials: true,
	methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
	allowedHeaders: 'Authorization,Content-Type',
};

app.use(express.json());
app.use(cors(corsOptions));

app.use(cookieParser());

app.get('/', (req, res) => {
	res.json('Welcome To Connectify');
});

const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: process.env.APP_URL,
		credentials: true,
	},
});

global.ioInstance = io;
global.onlineUsers = [];

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		console.error(err);
		return res.status(400).send({ status: 404, message: err.message }); // Bad request
	}
	next();
});

// routers

app.use('/api/v1/auth', require('./routes/auth.js'));
app.use('/api/v1/upload', require('./routes/upload.js'));
app.use('/api/v1/users', require('./routes/users.js'));
app.use('/api/v1/posts', require('./routes/posts.js'));
app.use('/api/v1/comments', require('./routes/comments.js'));
app.use('/api/v1/likes', require('./routes/likes.js'));
app.use('/api/v1/saves', require('./routes/postSaved.js'));
app.use('/api/v1/follow', require('./routes/follow.js'));
app.use('/api/v1/conversations', require('./routes/conversations.js'));
app.use('/api/v1/messages', require('./routes/messages.js'));
app.use('/api/v1/notifications', require('./routes/notification.js'));

const port = process.env.PORT || 3000;

server.listen(port, () => {
	console.log(`app running on port http://127.0.0.1:${port}...`);
});

// const onlineUsers = [];

// Socket.IO server setup
io.on('connection', (socket) => {
	console.log('new User connected ', onlineUsers);

	socket.on('new-user-add', (newUserId) => {
		if (!onlineUsers.some((user) => user.userId === newUserId)) {
			// if user is not added before
			onlineUsers.push({ userId: newUserId, socketId: socket.id });

			console.log('new user is here!', onlineUsers);
		}
		// send all active users to new user
		io.emit('get-users', onlineUsers);
	});

	socket.on('send-message', (message) => {
		io.emit('receive-message', message);
	});

	socket.on('disconnect', () => {
		console.log('A user disconnected');

		onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
		console.log('user disconnected', onlineUsers);
		// send all online users to all users
		io.emit('get-users', onlineUsers);
	});
});
