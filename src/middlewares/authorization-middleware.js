const authorization = role => {
    return (req,res,next) => {
        if (!req.user)
            return res.status(401).json ({status:'error', error: 'Sin autorización'})

        if(req.user.role != role)
            return res.status(401).json ({status:'error', error: 'Prohibido'})
        next()
    }
}


module.exports = authorization
