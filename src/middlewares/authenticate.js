const jwt = require('jsonwebtoken')

module.exports = async (req, res, next) => {
    let token = req.headers.authorization

    try {
        let decoded = await jwt.verify(token, process.env.JWT_SIGNATURE_KEY)
        req.user = decoded
        next()
    }
    catch (err) {
        res.status(401).json({
            success: false,
            errors: err,
        })
    }
}