const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/server.config');

const createToken = user => {
    return jwt.sign(user, jwtSecret, {expiresIn: '1h'});
}

const authTokenMiddleware = (req, res, next) => {
    const urlToken = req.query.token; 
    if (!urlToken) {
        return res.status(401).json({ error: 'No autorizado', message: 'Token no proporcionado' });
    }
    
    jwt.verify(urlToken, jwtSecret, (error, credentials) => {
        if (error) {
            if (error.name === 'TokenExpiredError') {
                return res.redirect('/RecoveryKey');
            } else {
                return res.status(401).json({ error: 'No autorizado', message: 'Token inválido' });
            }
        }
        
        next();
    });
};

module.exports = {
    createToken, 
    authTokenMiddleware
}
