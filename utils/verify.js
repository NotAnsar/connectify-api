const jwt = require('jsonwebtoken');

exports.verify = (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];
	if (!token)
		res.status(401).json({ status: 'error', message: 'Unauthorized' });

	jwt.verify(token, 'secretkey', (err, user) => {
		try {
			if (err) throw new AppError('Token is not Valid', 403);

			req.user = user;
			next();
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
