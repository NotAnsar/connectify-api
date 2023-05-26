const db = require('../connect');

const AppError = require('../utils/appError');
const { getRelease_dt } = require('../utils/getRelease_dt');

exports.getComments = (req, res) => {
	const { postId } = req.params;
	const q = `SELECT c.* ,u.nom,u.prenom,u.photo 
  FROM comments c 
  JOIN user u on c.user_id=u.id 
  WHERE post_id=${postId};`;

	db.query(q, async (err, data) => {
		try {
			if (err) throw new AppError();

			return res
				.status(200)
				.json({ status: 'success', message: '', comments: data });
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.addComments = (req, res) => {
	const { content, post_id } = req.body;

	if (!(content && post_id)) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const insertQuery =
		'INSERT INTO `comments` (`post_id`, `user_id`, `content`, `release_dt`) VALUES (?)';

	const newComment = {
		post_id,
		user_id: req.user.id,
		content: content,
		release_dt: getRelease_dt(),
	};

	db.query(insertQuery, [Object.values(newComment)], (err, data) => {
		try {
			if (err) throw new AppError();

			newComment.id = data.insertId;

			ioInstance.emit('commentAdded', post_id);

			res.status(200).json({
				status: 'success',
				message: 'comment added succesfully',
				comment: newComment,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.deleteComments = (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const insertQuery = 'DELETE FROM `comments` WHERE `comments`.`id` = ?';

	db.query(insertQuery, id, (err, _) => {
		try {
			if (err) throw new AppError();

			res.status(200).json({
				status: 'success',
				message: 'comment deleted succesfully',
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
