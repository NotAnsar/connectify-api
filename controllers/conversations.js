const db = require('../connect');
const AppError = require('../utils/appError');

exports.getMyConversations = (req, res) => {
	const q = `SELECT u.nom, u.prenom, u.photo, u.username ,u.id, c.id AS conversation_id
	FROM user u JOIN conversation c ON (c.participant1_id = u.id OR c.participant2_id = u.id) 
	WHERE (c.participant1_id = ? OR c.participant2_id = ?) AND (c.participant1_id <> ? OR c.participant2_id <> ?) AND u.id <> ?;
	`;

	db.query(
		q,
		[req.user.id, req.user.id, req.user.id, req.user.id, req.user.id],
		async (err, data) => {
			try {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: `here's your conversations`,
					conversations: data,
				});
			} catch (error) {
				return res
					.status(error.status)
					.json({ status: 'error', message: error.message });
			}
		}
	);
};

exports.newConversations = (req, res) => {
	const { participant_id } = req.body;

	if (!participant_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q = `SELECT * FROM conversation WHERE (participant1_id=? AND participant2_id =?) or (participant1_id=? AND participant2_id =?)`;

	db.query(
		q,
		[req.user.id, participant_id, participant_id, req.user.id],
		async (err, data) => {
			try {
				if (err) throw new AppError();

				if (data.length === 0) {
					const conversation = {
						participant1_id: participant_id,
						participant2_id: req.user.id,
					};

					const q1 = `INSERT INTO conversation (participant1_id, participant2_id) VALUES (?);`;
					db.query(q1, [Object.values(conversation)], async (err, data) => {
						if (err) throw new AppError();

						conversation.id = data.insertId;

						return res.status(201).json({
							status: 'success',
							message: `conversations created`,
							conversation,
						});
					});
				} else {
					return res.status(201).json({
						status: 'success',
						message: `conversations created`,
						conversation: data[0],
					});
				}
			} catch (error) {
				return res
					.status(error.status)
					.json({ status: 'error', message: error.message });
			}
		}
	);
};

exports.deleteConversation = (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}
	const q = `SELECT participant1_id ,participant2_id  FROM conversation WHERE id=?;`;
	const insertQuery = 'DELETE FROM conversation WHERE `conversation`.`id` = ?';

	db.query(q, id, (err, data) => {
		try {
			if (err) throw new AppError();
			const receiver = Object.values(data[0]).find(
				(num) => num !== req.user.id
			);

			const recipientSocket = onlineUsers.find(
				(user) => user.userId == receiver
			)?.socketId;

			if (recipientSocket)
				ioInstance.to(recipientSocket).emit('conversation-deleted', id);

			db.query(insertQuery, id, (err, _) => {
				if (err) throw new AppError();

				res.status(200).json({
					status: 'success',
					message: 'conversation deleted succesfully',
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
