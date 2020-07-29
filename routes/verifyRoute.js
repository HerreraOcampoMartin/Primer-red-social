const jwt = require('jsonwebtoken');

function authorize(req, res, next) {
    try {
        const token = req.cookies['auth-token'] || req.headers['auth-token-axios'];
        const userData = jwt.verify(token, process.env.JWT_KEY);
        req.userData = userData;
        next();
    } catch (ex) {
        res.status(300).send("ERROR de auth: " + ex);
    }
}

module.exports = authorize;