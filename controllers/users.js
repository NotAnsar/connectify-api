const db = require('../connect');
const AppError = require('../utils/appError');

exports.getProfile = (req, res) => {
	const { userid } = req.params;

	const q1 = `select * from user where id=?`;
	db.query(q1, userid, async (err, data) => {
		try {
			if (err) throw new AppError();

			if (data.length === 0) throw new AppError('User does not exist.', 404);
			const q = `SELECT u.*, 
			(SELECT COUNT(followed_id) FROM follow WHERE follower_id = ?) AS following, 
			(SELECT COUNT(follower_id) FROM follow WHERE followed_id =?) AS followers ,
			CASE WHEN ff.follower_id IS NOT NULL THEN 1 ELSE 0 END AS is_followed
			FROM user u 
			LEFT JOIN follow ff ON ff.followed_id = u.id and ff.follower_id = ?
			WHERE u.id=?;
		`;

			db.query(q, [userid, userid, req.user.id, userid], async (err, data) => {
				if (err) throw new AppError();
				data[0].password = undefined;
				return res.status(200).json({
					status: 'success',
					message: 'Here is your profile data',
					user: data[0],
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.updateUser = (req, res) => {
	const updates = req.body;

	if (
		Object.keys(updates).length === 0 ||
		'password' in updates ||
		'release_dt' in updates
	) {
		return res
			.status(400)
			.json({ status: 'error', message: 'No updates provided' });
	}

	const q = 'UPDATE user SET ? WHERE id = ?';

	db.query(q, [updates, req.user.id], async (err, data) => {
		try {
			if (err) throw new AppError();

			const q1 = 'SELECT * FROM user  WHERE id = ?';
			db.query(q1, [req.user.id], async (err, data) => {
				if (err) throw new AppError();

				data[0].password = undefined;
				return res.status(200).json({
					status: 'success',
					message: 'User updated successfully',
					user: data[0],
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
