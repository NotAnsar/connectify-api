const db = require('../connect');
const AppError = require('../utils/appError');

exports.getMyConversations = (req, res) => {
	const q = `SELECT u.nom, u.prenom, u.photo, u.id, c.id AS conversation_id, 
	COALESCE(m.content, NULL) AS last_message, COALESCE(m.release_dt, NULL) 
	FROM user u JOIN conversation c ON (c.participant1_id = u.id OR c.participant2_id = u.id) 
	LEFT JOIN ( SELECT conversation_id, MAX(id) AS last_message_id FROM messages GROUP BY conversation_id ) 
	AS subquery ON c.id = subquery.conversation_id 
	LEFT JOIN messages m ON subquery.last_message_id = m.id 
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
