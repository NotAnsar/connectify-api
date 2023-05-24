const db = require('../connect');
const AppError = require('../utils/appError');

exports.likePost = (req, res) => {
	const { post_id } = req.body;

	if (!post_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q = 'INSERT INTO `likes` (`user_id`, `post_id`) VALUES(?)';
	const likedPost = { user_id: req.user.id, post_id };

	db.query(q, [Object.values(likedPost)], async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: `the Post ${likedPost.post_id} was like by ${likedPost.user_id}`,
				likedPost,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.dislikePost = (req, res) => {
	const { post_id } = req.body;

	if (!post_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q = 'DELETE FROM likes WHERE user_id=? and post_id=?';
	const likedPost = { user_id: req.user.id, post_id };

	db.query(q, [likedPost.user_id, likedPost.post_id], async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: `the Post ${likedPost.post_id} was disliked by ${likedPost.user_id}`,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.getLikesByPost = (req, res) => {
	console.log('hi');
	const { post_id } = req.params;

	if (!post_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q = `SELECT u.id,u.prenom,u.nom,u.username,u.photo ,l.post_id,? me, p.user_id postuser_id,
	CASE WHEN f.follower_id IS NOT NULL THEN 1 ELSE 0 END AS is_followed
	FROM likes l
	JOIN user u on u.id=l.user_id
	JOIN posts p on p.id=l.post_id
	LEFT JOIN follow f ON f.followed_id = l.user_id and f.follower_id = ?
	WHERE l.post_id=?`;

	const likedPost = { user_id: req.user.id, post_id };

	db.query(
		q,
		[likedPost.user_id, likedPost.user_id, likedPost.post_id],
		async (err, data) => {
			try {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: ``,
					likes: data,
				});
			} catch (error) {
				return res
					.status(error.status)
					.json({ status: 'error', message: error.message });
			}
		}
	);
};
