const authMiddleware = require("./Private-acces-middleware")

const authorization = roles => {
    return (req,res,next) => {

        if (!req.user)
            return res.status(401).json ({status:'error', error: 'Sin autorización'})

        if(!roles.includes(req.user.role))
            return res.status(401).json ({status:'error', error: 'Prohibido'})
        
        next()
    }
}


module.exports = authorization