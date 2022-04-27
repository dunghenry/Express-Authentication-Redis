const jwt = require('jsonwebtoken');
const logEvents = require('../helpers/logEvents');
const verifyToken = async (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        const accessToken = token.split(" ")[1];
        jwt.verify(accessToken, process.env.MY_ACESSTOKEN_SECRET, async(err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    await logEvents(err.message, module.filename);
                    return res.status(401).json('Token is expired!!!');
                }
                // console.log(err);
                await logEvents(err.message, module.filename);
                return res.status(403).json('Token is not valid!!!');
            }
            req.userId = decoded.userId;
            next();
        })
    }
    else {
        await logEvents("You're not authenticated", module.filename);
        return res.status(401).json("You're not authenticated");
    }
}
module.exports = verifyToken;