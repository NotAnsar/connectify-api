const db = require('../connect');
const AppError = require('../utils/appError');
const { getRelease_dt } = require('../utils/getRelease_dt');

exports.getConversationMessages = (req, res) => {
	const { conversation_id } = req.params;
	const q = `SELECT * FROM messages WHERE conversation_id=?;`;

	db.query(q, conversation_id, async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: `here's your messages`,
				messages: data,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.sendMessage = (req, res) => {
	const { conversation_id, content, receiver } = req.body;

	if (!(conversation_id && content)) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q = `INSERT INTO messages (conversation_id, sender_id, content, release_dt) VALUES (?);`;

	const message = {
		conversation_id,
		sender_id: req.user.id,
		content,
		release_dt: getRelease_dt(),
	};

	db.query(q, [Object.values(message)], async (err, data) => {
		try {
			if (err) throw new AppError();

			message.id = data.insertId;

			// sending socket to the user who would receive the message
			const recipientSocket = onlineUsers.find(
				(user) => user.userId == receiver
			)?.socketId;

			if (recipientSocket)
				ioInstance.to(recipientSocket).emit('receive-message', message);

			return res.status(200).json({
				status: 'success',
				message: `Message was sent successfully`,
				message: message,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
