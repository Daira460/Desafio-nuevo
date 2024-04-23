const { Router } = require('express')
const authorization = require('../middlewares/authorization-middleware')
const router = Router()


router.get('/', authorization('user'), async (req, res) => {
    try {
        res.render ('chat', {style:'style.css'})  
    } catch (error) {

        req.logger.error ('Error al cargar el chat:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
   
})

module.exports = router 