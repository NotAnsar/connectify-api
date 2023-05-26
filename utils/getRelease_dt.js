exports.getRelease_dt = () => {
	const now = new Date();
	now.setUTCHours(now.getUTCHours() + 1);
	return now.toISOString().slice(0, 19).replace('T', ' ');
};
