const db = require('../connect');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { getRelease_dt } = require('../utils/getRelease_dt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASS,
	},
});

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
		console.log('hi');
		try {
			if (err) throw new AppError();
			console.log(data);
			// user exists
			if (data.length === 1)
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
				throw new AppError('There is no user with this email address.', 404);

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

exports.changePassword = (req, res) => {
	const { oldPassword, newPassword } = req.body;

	if (!(oldPassword && newPassword))
		return res.status(401).json({
			status: 'error',
			message: 'Please provide your old Password and yout new Password',
		});

	const q = `select * from user where id=?`;
	db.query(q, [req.user.id], async (err, data) => {
		try {
			if (err) throw new AppError();

			if (data.length === 0)
				throw new AppError('There is no user with id.', 404);

			const checkPassword = await bcrypt.compare(oldPassword, data[0].password);

			if (!checkPassword) throw new AppError('Wrong Password', 401);

			const hashedPass = await bcrypt.hash(newPassword, 10);

			const q = 'UPDATE user SET password=? WHERE id = ?';

			db.query(q, [hashedPass, req.user.id], (err, data) => {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: 'User Password Changed successfully',
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.resetPassword = (req, res) => {
	const { newPassword, email } = req.body;
	console.log(req.body);
	if (!(email && newPassword))
		return res.status(401).json({
			status: 'error',
			message: 'Please provide your new Password',
		});

	const q = `select * from user where email=?`;
	db.query(q, [email], async (err, data) => {
		try {
			if (err) throw new AppError();

			if (data.length === 0)
				throw new AppError('There is no user with this email.', 404);

			const hashedPass = await bcrypt.hash(newPassword, 10);

			const q = 'UPDATE user SET password=? WHERE email = ?';

			db.query(q, [hashedPass, email], (err, data) => {
				if (err) throw new AppError();

				return res.status(200).json({
					status: 'success',
					message: 'User Password Changed successfully',
				});
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.sendOTP = (req, res) => {
	const { email, register = true } = req.body;

	if (!email)
		return res
			.status(401)
			.json({ status: 'error', message: 'Please provide an email' });

	const q = `select * from user where email=?`;
	db.query(q, [email], async (err, data) => {
		try {
			if (err) throw new AppError();

			if (register) {
				if (data.length === 1)
					throw new AppError('User Already Exist. Please Login', 409);
			} else {
				console.log(data);
				if (data.length === 0)
					throw new AppError('There is no user with this email address.', 404);
			}

			// try {
			const OTPCode = generateOTP();
			const mailOptions = {
				from: 'karrouach.ansar@gmail.com',
				to: email,
				subject: 'OTP for Registration',
				text: `Your OTP for registration is: ${OTPCode}`,
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					throw new AppError('Error occurred while sending email', 400);
				} else {
					return res.status(200).json({
						status: 'success',
						message: 'OTP Code sent successfully to your email !',
						otp: OTPCode,
					});
				}
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
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

function generateOTP() {
	var randomNumber = Math.floor(Math.random() * 9999) + 1; // Generate a random number between 1 and 9999
	var formattedNumber = randomNumber.toString().padStart(4, '0'); // Format the number with leading zeros

	return formattedNumber;
}
