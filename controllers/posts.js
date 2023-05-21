const jwt = require('jsonwebtoken');
const db = require('../connect');
const AppError = require('../utils/appError');

exports.getPosts = (req, res) => {
	const q = `select p.*,u.nom,u.prenom,u.photo,count(l.user_id) as comments,count(c.id) as likes 
  from posts p 
  JOIN user u ON u.id=p.user_id 
  LEFT JOIN likes l ON l.post_id=p.id 
  LEFT JOIN comments c ON c.post_id=p.id 
  GROUP by p.id 
  ORDER BY p.release_dt DESC `;

	db.query(q, async (err, data) => {
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
	});
};

exports.getMyPosts = (req, res) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token)
		res.status(401).json({ status: 'error', message: 'Unauthorized' });

	jwt.verify(token, 'secretkey', (err, user) => {
		try {
			if (err) throw new AppError('Token is not Valid', 401);

			const q1 = `select * from user where id=?`;
			db.query(q1, user.id, async (err, data) => {
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
										LEFT JOIN likes le ON le.post_id = p.id 
										LEFT JOIN saved s ON s.post_id = p.id 
										where u.id=?
										GROUP by p.id
										ORDER BY p.release_dt DESC`;

				db.query(q, [user.id], async (err, data) => {
					if (err) throw new AppError();

					return res
						.status(200)
						.json({ status: 'success', message: '', posts: data });
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.getFeedPost = (req, res) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token)
		res.status(401).json({ status: 'error', message: 'Unauthorized' });

	jwt.verify(token, 'secretkey', (err, user) => {
		try {
			if (err) throw new AppError('Token is not Valid', 401);
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
				[user.id, user.id, user.id, user.id, user.id],
				async (err, data) => {
					if (err) throw new AppError();

					return res
						.status(200)
						.json({ status: 'success', message: '', posts: data });
				}
			);
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.getSavedPost = (req, res) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token)
		res.status(401).json({ status: 'error', message: 'Unauthorized' });

	jwt.verify(token, 'secretkey', (err, user) => {
		try {
			console.log(user);
			if (err) throw new AppError('Token is not Valid', 401);

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

			db.query(q, [user.id, user.id, user.id, user.id], async (err, data) => {
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
