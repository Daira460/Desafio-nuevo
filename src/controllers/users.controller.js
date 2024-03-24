const { Router } = require('express');
const router = Router();
const passport = require('passport');
const UserService = require('../services/user.service');
const ErrorPersonalizado = require('../errores/Error-Personalizado');
const TiposErrores = require('../errores/tipos-errores');
const generateProductErrorDetails = require('../errores/generateProductErrorDetails');
const CodigosErrores = require('../errores/codigos_errores');

router.get('/user-cart', async (req, res, next) => {
    try {
        const cid = req.session.cart;
        if (!cid) {
            if (!req.user) {
                throw new ErrorPersonalizado({
                    name: TiposErrores.NOT_AUTHORIZED,
                    cause: 'No estás autenticado',
                    message: 'No estás autenticado',
                    code: CodigosErrores.NOT_AUTHORIZED,
                });
            }
            const uid = req.user._id;
            const userCart = await UserService.getUserCart(uid);
            if (!userCart) {
                ErrorPersonalizado.createError({
                    name: TiposErrores.USER_NOT_EXIST,
                    cause: 'No se encontró el usuario en la base de datos',
                    message: 'El usuario no existe',
                    code: CodigosErrores.NOT_FOUND,
                });
                return;
            }
            res.status(200).json({ status: 'success', cid: userCart });
        }
    } catch (error) {
        next(error);
    }
});

router.post('/', passport.authenticate('register', { failureRedirect: '/api/users/fail-Register' }), async (req, res) => {
    try {
        res.status(201).json({ status: 'success', message: 'Usuario' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/fail-Register', (req, res) => {
    console.log('Fallo registro');
    res.status(400).json({ status: 'error', error: 'Bad Request' });
});

router.put('/', async (req, res) => {
    try {
        const uid = req.user._id;
        const { cart: cid } = req.body;

        await UserService.updateUserCart(uid, cid);

        res.status(200).json({ status: 'success', message: 'User cart updated successfully' });
    } catch (error) {
        console.error('Error al actualizar el carrito del usuario:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
