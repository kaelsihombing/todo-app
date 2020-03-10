const translator = require('./helpers/translate').translator
exports.serverError = (err, req, res, next) => {
	res.status(500).json ({
		status: false,
		errors: err
	})
}

exports.notFound = async (req, res) => {	
	res.status(404).json ({
		status: false,
		errors: await translator('wrongEndPoint', req)
	})
}