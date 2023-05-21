const db = require('../connect');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

exports.getRelease_dt = () =>
	new Date().toISOString().slice(0, 19).replace('T', ' ');

exports.register = (req, res) => {
	//check required input exist
	const {
		email,
		password,
		username,
		prenom,
		nom,
		city,
		country,
		relationship,
	} = req.body;

	console.log(req.body);
	if (
		!(
			email &&
			password &&
			username &&
			prenom &&
			nom &&
			city &&
			country &&
			relationship
		)
	) {
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide required inputs' });
	}

	// check user exists
	const q = `select * from user where email=? or username=?`;
	db.query(q, [email, username], async (err, data) => {
		try {
			if (err) throw new AppError();
			// user exists
			if (data.length)
				throw new AppError('User Already Exist. Please Login', 409);

			// hash password
			const hashedPass = await bcrypt.hash(password, 10);

			// add new User
			const insertQuery =
				'INSERT INTO user (`prenom`,`nom`,`email`,`username`,`password`,`city`,`country`,`relationship`	,`release_dt`) VALUES (?)';

			const newUser = {
				prenom,
				nom,
				email,
				username,
				password: hashedPass,
				city,
				country,
				relationship,
				release_dt: getRelease_dt(),
			};

			// Object.values(newUser) convert new user object to array
			db.query(insertQuery, [Object.values(newUser)], (err, data) => {
				if (err) throw new AppError();
				newUser.id = data.insertId;
				console.log(newUser);
				createToken(newUser, res, 201, 'User has been Created', req);
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.login = (req, res) => {
	const { email, password } = req.body;

	if (!(email && password))
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide email and password!' });

	const q = `select * from user where email=?`;
	db.query(q, [email], async (err, data) => {
		try {
			if (err) throw new AppError();

			if (data.length === 0)
				throw new AppError('There is no user with email address.', 404);

			const checkPassword = await bcrypt.compare(password, data[0].password);

			if (!checkPassword) throw new AppError('Wrong Password', 401);

			createToken(data[0], res, 200, 'User Found', req);
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.logout = (req, res) => {
	res.clearCookie('accessToken', {
		secure: true,
		sameSite: 'none',
	});

	res
		.status(200)
		.json({ status: 'success', message: 'User has been Logged Out' });
};

function createToken(user, res, statusCode, message, req) {
	const token = jwt.sign({ id: user.id }, 'secretkey');

	// adding token to cookie

	// res.cookie('accessToken', token, {
	// 	httpOnly: true,
	// 	expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Set the expiration date to three days in the future
	// 	secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
	// });

	// console.log({
	// 	httpOnly: true,
	// 	expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Set the expiration date to three days in the future
	// 	secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
	// });

	user.password = undefined;

	return res
		.status(statusCode)
		.json({ status: 'success', message, user, token });
}
