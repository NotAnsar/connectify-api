const db = require('../connect');
const path = require('path');
const fs = require('fs/promises');
const AppError = require('./appError');

const deletePicture = (query, column, id, res) => {
	console.log('deletePicfun', query, column, id);
	db.query(query, id, async (err, data) => {
		try {
			if (err) throw new AppError();
			const imageName = data[0][column];
			const imageFile = path.join(process.cwd(), 'images', imageName);
			console.log('deleting', imageFile);
			const result = await fs.unlink(imageFile);
			console.log(result);
		} catch (error) {
			console.log(error);
			return res.status(error.status).json({
				status: 'error',
				message: 'Somethig went wrong while deleting Your picture',
			});
		}
	});
};

module.exports = { deletePicture };
