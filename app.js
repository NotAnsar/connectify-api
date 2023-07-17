const express = require('express');
require('dotenv').config();
const cors = require('cors');
const userRouter = require('./routes/users.js');
const commentsRouter = require('./routes/comments.js');
const authRouter = require('./routes/auth.js');
const likesRouter = require('./routes/likes.js');
const savedRouter = require('./routes/postSaved.js');
const postsRouter = require('./routes/posts.js');
const followRouter = require('./routes/follow.js');
const uploadRouter = require('./routes/upload.js');
const conversationsRouter = require('./routes/conversations.js');
const messagesRouter = require('./routes/messages.js');
const notificationsRouter = require('./routes/notification.js');
const cookieParser = require('cookie-parser');

const http = require('http');
const socketIO = require('socket.io');

const app = express();

// const corsOptions = { origin: 'http://127.0.0.1:5173', credentials: true };
const corsOptions = { origin: process.env.CLIENT_APP_URL, credentials: true };

app.use(express.json());
app.use(cors(corsOptions));

app.use(cookieParser());

app.get('/', (req, res) => {
	res.send('<h1>Hello</h1>');
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
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/likes', likesRouter);
app.use('/api/v1/saves', savedRouter);
app.use('/api/v1/follow', followRouter);
app.use('/api/v1/conversations', conversationsRouter);
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/notifications', notificationsRouter);

const port = process.env.PORT || 3000;

server.listen(port, () => {
	// http.listen(port, () => {
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
