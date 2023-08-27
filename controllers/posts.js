const db = require('../connect');
const AppError = require('../utils/appError');
const { getRelease_dt } = require('../utils/getRelease_dt');

exports.getFeedPost = (req, res) => {
	const q = `SELECT p.*, u.nom, u.prenom, u.photo, 
			COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT l.user_id) AS likes, 
			CASE WHEN s.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_saved, 
			CASE WHEN le.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked ,
			CASE WHEN ff.follower_id IS NOT NULL THEN 1 ELSE 0 END AS is_followed
			FROM posts p 
			JOIN user u ON u.id = p.user_id 
			LEFT JOIN follow f ON f.followed_id=p.user_id 
			LEFT JOIN likes l ON l.post_id = p.id 
			LEFT JOIN likes le ON le.post_id = p.id and le.user_id = ?
			LEFT JOIN comments c ON c.post_id = p.id 
			LEFT JOIN saved s ON s.post_id = p.id AND s.user_id = ?
			LEFT JOIN follow ff ON ff.followed_id = p.user_id and ff.follower_id = ?
			where f.follower_id=? or p.user_id=? 
			GROUP BY p.id 
			ORDER BY p.release_dt DESC;`;

	db.query(
		q,
		[req.user.id, req.user.id, req.user.id, req.user.id, req.user.id],
		async (err, data) => {
			try {
				if (err) throw new AppError();

				return res
					.status(200)
					.json({ status: 'success', message: '', posts: data });
			} catch (error) {
				return res
					.status(error.status)
					.json({ status: 'error', message: error.message });
			}
		}
	);
};

exports.getSavedPost = (req, res) => {
	const q = `SELECT p.*,u2.nom, u2.prenom, u2.photo, 
			COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT l.user_id) AS likes, 
			CASE WHEN s2.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_saved, 
			CASE WHEN le.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked,
			CASE WHEN ff.follower_id IS NOT NULL THEN 1 ELSE 0 END AS is_followed
			FROM posts p 
			JOIN saved s ON s.post_id = p.id 
			JOIN user u ON u.id = s.user_id 
			JOIN user u2 ON u2.id = p.user_id 
			LEFT JOIN likes l ON l.post_id = p.id 
			LEFT JOIN comments c ON c.post_id = p.id 
			LEFT JOIN likes le ON le.post_id = p.id and le.user_id = ? 
			LEFT JOIN saved s2 ON s2.post_id = p.id AND s2.user_id = ?
			LEFT JOIN follow ff ON ff.followed_id = p.user_id and ff.follower_id = ?
			WHERE s.user_id=? GROUP BY p.id ORDER BY p.release_dt DESC;`;

	db.query(
		q,
		[req.user.id, req.user.id, req.user.id, req.user.id],
		async (err, data) => {
			try {
				if (err) throw new AppError();

				return res
					.status(200)
					.json({ status: 'success', message: '', posts: data });
			} catch (error) {
				return res
					.status(error.status)
					.json({ status: 'error', message: error.message });
			}
		}
	);
};

exports.getPostsByUser = (req, res) => {
	const { user_id } = req.params;
	const q1 = `select * from user where id=?`;
	db.query(q1, user_id, async (err, data) => {
		try {
			if (err) throw new AppError();

			if (data.length === 0)
				throw new AppError('There is no user with this id.', 404);

			const q = `select p.*,u.nom,u.prenom,u.photo,
										COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT l.user_id) AS likes,
										CASE WHEN s.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_saved, 
										CASE WHEN le.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked 
										from posts p 
										JOIN user u ON u.id=p.user_id 
										LEFT JOIN likes l ON l.post_id=p.id 
										LEFT JOIN comments c ON c.post_id=p.id 
										LEFT JOIN likes le ON le.post_id = p.id and le.user_id = ?
										LEFT JOIN saved s ON s.post_id = p.id AND s.user_id = ?
										where u.id=?
										GROUP by p.id
										ORDER BY p.release_dt DESC`;

			db.query(q, [req.user.id, req.user.id, user_id], async (err, data) => {
				if (err) throw new AppError();

				return res
					.status(200)
					.json({ status: 'success', message: '', posts: data });
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.getAllPosts = (req, res) => {
	const q = `SELECT p.*, u.nom, u.prenom, u.photo, 
	COUNT(DISTINCT c.id) AS comments, COUNT(DISTINCT l.user_id) AS likes, 
	CASE WHEN s.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_saved, 
	CASE WHEN le.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked ,
	CASE WHEN ff.follower_id IS NOT NULL THEN 1 ELSE 0 END AS is_followed
	FROM posts p 
	JOIN user u ON u.id = p.user_id 
	LEFT JOIN follow f ON f.followed_id=p.user_id 
	LEFT JOIN likes l ON l.post_id = p.id 
	LEFT JOIN likes le ON le.post_id = p.id and le.user_id = ?
	LEFT JOIN comments c ON c.post_id = p.id 
	LEFT JOIN saved s ON s.post_id = p.id AND s.user_id = ?
	LEFT JOIN follow ff ON ff.followed_id = p.user_id and ff.follower_id = ?
	GROUP BY p.id 
	ORDER BY p.release_dt DESC;`;

	db.query(q, [req.user.id, req.user.id, req.user.id], async (err, data) => {
		try {
			if (err) throw new AppError();

			console.log(data);
			return res
				.status(200)
				.json({ status: 'success', message: '', posts: data });
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.addPost = (req, res) => {
	const { description, img } = req.body;

	if (!(description || img)) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	const q =
		'INSERT INTO `posts` (`user_id`, `description`, `img`, `release_dt`) VALUES (?);';

	const newPost = {
		user_id: req.user.id,
		description: description === undefined ? null : description,
		img: img === undefined ? null : img,
		release_dt: getRelease_dt(),
	};

	db.query(q, [Object.values(newPost)], async (err, data) => {
		try {
			if (err) throw new AppError();

			newPost.id = data.insertId;

			return res
				.status(200)
				.json({ status: 'success', message: '', post: newPost });
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.deletePost = (req, res) => {
	const { id } = req.params;

	const q = 'DELETE FROM `posts` WHERE id=?';

	db.query(q, [id], async (err, data) => {
		try {
			if (err) throw new AppError();

			return res
				.status(204)
				.json({ status: 'success', message: 'Post Deleted' });
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.updatePost = (req, res) => {
	const updates = req.body;
	const { id } = req.params;

	if (
		Object.keys(updates).length === 0 ||
		'id' in updates ||
		'release_dt' in updates
	) {
		return res
			.status(400)
			.json({ status: 'error', message: 'No updates provided' });
	}

	const q = 'UPDATE posts SET ? WHERE id = ?';

	db.query(q, [updates, id], async (err, data) => {
		try {
			if (err) throw new AppError();

			const q1 = 'SELECT * FROM user  WHERE id = ?';
			db.query(q1, [req.user.id], async (err, data) => {
				if (err) throw new AppError();

				data[0].password = undefined;
				return res.status(200).json({
					status: 'success',
					message: 'User updated successfully',
					data: data[0],
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
