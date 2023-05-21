const jwt = require('jsonwebtoken');
const db = require('../connect');
const AppError = require('../utils/appError');

exports.savePost = (req, res) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];
	const { post_id } = req.body;

	if (!post_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	if (!token)
		res.status(401).json({ status: 'error', message: 'Unauthorized' });

	jwt.verify(token, 'secretkey', (err, user) => {
		try {
			if (err) throw new AppError('Token is not Valid', 401);

			const q = 'INSERT INTO `saved` (`user_id`, `post_id`) VALUES(?)';
			const savedPost = { user_id: user.id, post_id };

			db.query(q, [Object.values(savedPost)], async (err, data) => {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: `the Post ${savedPost.post_id} was saved by ${savedPost.user_id}`,
					savedPost,
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.unsavePost = (req, res) => {
	console.log(req);
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];
	const { post_id } = req.body;

	if (!post_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	if (!token)
		res.status(401).json({ status: 'error', message: 'Unauthorized' });

	jwt.verify(token, 'secretkey', (err, user) => {
		try {
			if (err) throw new AppError('Token is not Valid', 401);

			const q = 'DELETE FROM saved WHERE user_id=? and post_id=?';
			const savedPost = { user_id: user.id, post_id };

			db.query(q, [savedPost.user_id, savedPost.post_id], async (err, data) => {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: `the Post ${savedPost.post_id} was unsaved by ${savedPost.user_id}`,
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
