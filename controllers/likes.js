const jwt = require('jsonwebtoken');
const db = require('../connect');
const AppError = require('../utils/appError');

exports.likePost = (req, res) => {
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

			const q = 'INSERT INTO `likes` (`user_id`, `post_id`) VALUES(?)';
			const likedPost = { user_id: user.id, post_id };

			db.query(q, [Object.values(likedPost)], async (err, data) => {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: `the Post ${likedPost.post_id} was like by ${likedPost.user_id}`,
					likedPost,
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.dislikePost = (req, res) => {
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

			const q = 'DELETE FROM likes WHERE user_id=? and post_id=?';
			const likedPost = { user_id: user.id, post_id };

			db.query(q, [likedPost.user_id, likedPost.post_id], async (err, data) => {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: `the Post ${likedPost.post_id} was disliked by ${likedPost.user_id}`,
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
