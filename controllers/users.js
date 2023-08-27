const db = require('../connect');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');

exports.getMe = (req, res) => {
	const q1 = `select * from user where id=?`;
	db.query(q1, req.user.id, async (err, data) => {
		try {
			if (err) throw new AppError();

			if (data.length === 0) throw new AppError('User does not exist.', 404);
			const q = `SELECT * FROM user WHERE id=?;`;

			db.query(q, [req.user.id], async (err, data) => {
				if (err) throw new AppError();
				data[0].password = undefined;

				return res.status(200).json({
					status: 'success',
					message: 'Here is your data',
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

			const q1 = 'SELECT * FROM user WHERE id = ?';
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

exports.deleteMe = (req, res) => {
	const { password } = req.body;

	if (!password) {
		return res
			.status(400)
			.json({ status: 'error', message: 'provide password' });
	}

	const q = `select * from user where id=?`;
	db.query(q, [req.user.id], async (err, data) => {
		try {
			if (err) throw new AppError();

			if (data.length === 0)
				throw new AppError('There is no user with this Id.', 404);

			const checkPassword = await bcrypt.compare(password, data[0].password);
			if (!checkPassword) throw new AppError('Wrong Password', 401);

			const q1 = 'DELETE FROM user WHERE `user`.`id` = ?';
			db.query(q1, [req.user.id], async (err, data) => {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: 'User Deleted successfully',
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.getSuggestedUsers = (req, res) => {
	const q1 = `SELECT u.id ,u.prenom,u.nom ,u.username ,u.photo ,
							IF(ff.follower_id IS NOT NULL, 1, 0) AS is_followed 
							FROM user u
							LEFT JOIN follow ff ON ff.followed_id = u.id AND ff.follower_id = ?
							WHERE IF(ff.follower_id IS NOT NULL, 1, 0) = 0 AND u.id <> ?;`;

	db.query(q1, [req.user.id, req.user.id], async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: 'Here is your suggested users',
				users: data,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.getFriends = (req, res) => {
	const q1 = `SELECT DISTINCT u.id ,u.prenom,u.nom ,u.username ,u.photo ,
							IF(ff.follower_id IS NOT NULL, 1, 0) AS is_followed 
							FROM user u
							LEFT JOIN follow ff ON ff.followed_id = u.id AND ff.follower_id = ?
							WHERE IF(ff.follower_id IS NOT NULL, 1, 0) = 1`;

	db.query(q1, [req.user.id], async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: 'Here is your Friend list',
				users: data,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.search = (req, res) => {
	const { searchData } = req.body;

	if (!searchData) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q1 = ` SELECT u.id, u.prenom, u.username ,u.nom, u.photo FROM user u
	WHERE (username LIKE '%${searchData}%' OR prenom LIKE '%${searchData}%' OR nom LIKE '%${searchData}%')`;

	db.query(q1, req.user.id, async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: 'Here is your data',
				friends: data,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
