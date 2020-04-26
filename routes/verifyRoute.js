const jwt = require('jsonwebtoken');

function authorize(req, res, next) {
    try {
        const token = req.cookies['auth-token'];
        const userData = jwt.verify(token, process.env.JWT_KEY);
        req.userData = userData;
        next();
    } catch (ex) {
        res.send('ERROR: ' + ex);
    }
}

module.exports = authorize;