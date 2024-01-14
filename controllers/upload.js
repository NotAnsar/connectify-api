const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'images/');
	},
	filename: function (req, file, cb) {
		const uniqueFilename = uuidv4() + file.originalname;
		cb(null, uniqueFilename);
	},
});

exports.upload = multer({ storage: storage });

exports.uploadFile = (req, res) => {
	const file = req.file;

	return res.status(200).json({
		status: 'success',
		message: 'File Uploaded',
		filename: file.filename,
	});
};
