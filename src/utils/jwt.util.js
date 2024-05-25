const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/server.config')

const generateToken = user => {
    return jwt.sign(user, jwtSecret, {expiresIn: '1h'})
}

const authTokenMiddleware = (req, res, next) => {
    const urlToken = req.query.token 

    if (!urlToken) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Missing token' })
    }
    
    jwt.verify(urlToken, jwtSecret, (error, credentials) => {
        if (error) {
            if (error.name === 'TokenExpiredError') {
                return res.redirect('/recoveryKey')
            } else {
                return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' })
            }
        }
        
        next()
    })
}
module.exports = {
    generateToken, 
    authTokenMiddleware
}