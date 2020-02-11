exports.serverError = (err, req, res, next) => {
	res.status(500).json ({
		status: false,
		errors: err
	})
}

exports.notFound = (req, res) => {
	res.status(404).json ({
		status: false,
		errors: 'You Lost! please make sure your end point is valid'
	})
}