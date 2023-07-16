const db = require('../connect');

exports.addNotification = (sender, receiver, type, timestamp) => {
	console.log(sender, receiver, type, timestamp);
	const q =
		'INSERT INTO `notification` (`sender`, `receiver`, `type`, `timestamp`, `seen`) VALUES(?)';
	const newNotification = { sender, receiver, type, timestamp, seen: false };
	db.query(q, [Object.values(newNotification)], async (err, _) => {
		try {
			if (err) throw new AppError();
			console.log(_);
			return true;
		} catch (error) {
			return false;
		}
	});
};

exports.getNotification = (req, res) => {
	const q1 = `SELECT u.id as user_id,u.prenom,u.nom,u.photo,u.username,n.* FROM notification n JOIN user u ON n.sender=u.id WHERE n.receiver=?  ORDER by n.timestamp desc ;`;
	db.query(q1, req.user.id, async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(200).json({
				status: 'success',
				message: 'Here is your notifications',
				notification: data,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.getUnseenNotificationCount = (req, res) => {
	const q1 = `SELECT COUNT(notification.seen) as count  FROM notification WHERE receiver=? and seen=0;`;
	db.query(q1, req.user.id, async (err, data) => {
		try {
			if (err) throw new AppError();

			console.log(data);
			return res.status(200).json({
				status: 'success',
				message: 'Here is your notifications',
				count: data[0].count,
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};

exports.setAllSeen = (req, res) => {
	const q1 = `UPDATE notification SET seen = '1' WHERE receiver=?;`;
	db.query(q1, req.user.id, async (err, data) => {
		try {
			if (err) throw new AppError();

			return res.status(201).json({
				status: 'success',
				message: 'Here is your notifications',
			});
		} catch (error) {
			return res
				.status(error.status)
				.json({ status: 'error', message: error.message });
		}
	});
};
