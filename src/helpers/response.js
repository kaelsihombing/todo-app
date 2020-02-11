function success(res, data, statusCode) {
    return res.status(statusCode).json({
        success: true,
        data
    })
}

function error(res, err, statusCode) {
    return res.status(statusCode).json({
        success: false,
        error: err
    })
}

module.export = {
    success,
    error
};