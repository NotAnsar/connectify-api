const db = require('../connect');
const AppError = require('../utils/appError');

exports.follow = (req, res) => {
	const { user_id: followed_id } = req.body;

	if (!followed_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q = 'INSERT INTO `follow` (`follower_id`, `followed_id`) VALUES(?)';
	const newFollow = { follower_id: req.user.id, followed_id };

	db.query(q, [Object.values(newFollow)], async (err, _) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: `the user ${newFollow.follower_id} followed ${newFollow.followed_id}`,
				newFollow,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.unfollow = (req, res) => {
	const { user_id: followed_id } = req.body;

	if (!followed_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q = 'DELETE FROM follow WHERE follower_id=? and followed_id=?';
	const newunFollow = { follower_id: req.user.id, followed_id };

	db.query(
		q,
		[newunFollow.follower_id, newunFollow.followed_id],
		async (err, data) => {
			try {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: `the user ${newunFollow.follower_id} unfollowed ${newunFollow.followed_id}`,
				});
			} catch (error) {
				return res
					.status(error.status)
					.json({ status: 'error', message: error.message });
			}
		}
	);
};
