const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users.js');
const commentsRouter = require('./routes/comments.js');
const authRouter = require('./routes/auth.js');
const likesRouter = require('./routes/likes.js');
const savedRouter = require('./routes/postSaved.js');
const postsRouter = require('./routes/posts.js');
const cookieParser = require('cookie-parser');

const http = require('http');
const socketIO = require('socket.io');

const app = express();

const corsOptions = { origin: 'http://127.0.0.1:5173', credentials: true };

app.use(express.json());
app.use(cors(corsOptions));

app.use(cookieParser());

const server = http.createServer(app);
const io = socketIO(server, {
	cors: {
		origin: 'http://localhost:3000',
		credentials: true,
	},
});

global.ioInstance = io;

// if req.body not json throw errow

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		console.error(err);
		return res.status(400).send({ status: 404, message: err.message }); // Bad request
	}
	next();
});

// routers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/likedPosts', likesRouter);
app.use('/api/v1/savedPosts', savedRouter);
app.use('/api/v1/posts', postsRouter);

const port = '3000';

server.listen(port, () => {
	// http.listen(port, () => {
	console.log(`app running on port http://127.0.0.1:${port}...`);
});

// Socket.IO server setup
io.on('connection', (socket) => {
	console.log('someone has connected');
	io.emit('firstEVENT', 'Hello from server!');

	socket.on('firstEVENT', (s) => {
		console.log(s);
	});
	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
	socketInstance = io;
});

// module.exports = socketInstance;
