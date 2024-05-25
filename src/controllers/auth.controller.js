const { Router } = require('express')
const passport = require('passport')
const router = Router()
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/server.config')
const SensibleDTO = require ('../DTO/sensible-user')




router.post ('/', passport.authenticate('login', {failureRedirect: '/auth/fail-login'}) , async (req, res) => {
    try {
        const {email} = req.body
        const lowercaseEmail = email.toLowerCase()

        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: lowercaseEmail,
            age: req.user.age,
            role: req.user.role,
            cart: req.user.cart,
        }
        res.json({status: 'success', message: 'Inicio de sesión exitoso'})
     } catch (error) {
        next(error)
    }
})

router.get('/current', (req, res) => {
    if (req.isAuthenticated()) {
        const userDTO = new SensibleDTO(req.user)
        res.json({ message: userDTO })
    } else {
        res.status(401).json({status: 'error', message: 'El usuario no está autenticado' })
    }
})


router.get('/fail-login', (req, res) => {
    req.logger.info ('Fallo el logueo')
    res.status(400).json({status: 'error',  error: 'Solicitud Incorrecta.' })
})

router.get('/logout', async (req, res, next) => {
    try {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' })
            } else {
                return res.status(200).json({ message: 'Cierre de sesión exitoso' })
            }
        })
    } catch (error) {
        next(error)
    }
})
router.post('/forgotPassword', async (req, res, next) => {
    try {
        const token = req.body.token
        const decodedToken = jwt.verify(token, jwtSecret) 
        const email = decodedToken.email 
        const { password } = req.body

        await UserService.updatePassword(email, password)

        res.status(200).json({ status: 'Success', message: 'Password Updated' })
    } catch (error) {
        next(error)
    }
})

router.post('/recoveryKey', async (req, res, next) => {
    try {
        const { email } = req.body
        const result = await UserService.sendRecoveryEmail(email)
        res.status(result.status === 'Success' ? 200 : 404).json(result)
    } catch (error) {
        next(error)
    }
})

router.get('/github', passport.authenticate('github', {scope: ['user: email']}, (req, res) => {}))

router.get('/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}),
    (req, res) => {
    req.session.user = req.user
    res.redirect('/api/products')
    }
)

module.exports = router