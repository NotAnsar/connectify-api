const db = require('../connect');
const AppError = require('../utils/appError');

exports.follow = (req, res) => {
	const { followed_id } = req.params;

	if (!followed_id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const follow = { follower_id: req.user.id, followed_id };
	const q1 = 'SELECT * FROM `follow` WHERE follower_id=? and followed_id=?';

	db.query(q1, Object.values(follow), async (err, data) => {
		try {
			if (err) throw new AppError();

			let q, values;
			let resObject = { status: 'success', message: `` };
			if (data.length === 0) {
				console.log('followed');
				values = [Object.values(follow)];
				q = 'INSERT INTO `follow` (`follower_id`, `followed_id`) VALUES(?)';
				resObject.message = `the user ${follow.follower_id} followed ${follow.followed_id}`;
				resObject.follow = follow;
			} else {
				console.log('unfollowed');
				values = Object.values(follow);
				q = 'DELETE FROM follow WHERE follower_id=? and followed_id=?';
				resObject.message = `the user ${follow.follower_id} unfollowed ${follow.followed_id}`;
			}

			db.query(q, values, async (err, _) => {
				if (err) throw new AppError();

				// ioInstance.emit('userFollowed', post_id);

				return res.status(200).json(resObject);
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
