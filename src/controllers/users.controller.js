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
                    nombre: TiposErrores.NO_AUTORIZADO,
                    causa: 'No estás autenticado',
                    mensaje: 'No estás autenticado',
                    codigo: CodigosErrores.NO_AUTORIZADO,
                });
            }
            const uid = req.user._id;
            const userCart = await UserService.getUserCart(uid);
            if (!userCart) {
                throw new ErrorPersonalizado({
                    nombre: TiposErrores.USUARIO_NO_EXISTE,
                    causa: 'No se encontró el usuario en la base de datos',
                    mensaje: 'El usuario no existe',
                    codigo: CodigosErrores.NO_ENCONTRADO,
                });
            }
            res.status(200).json({ estado: 'éxito', cid: userCart });
        }
    } catch (error) {
        next(error);
    }
});

router.post('/', passport.authenticate('register', { failureRedirect: '/api/users/fail-Register' }), async (req, res) => {
    try {
        res.status(201).json({ status: 'success', message: 'Usuario' });
    } catch (error) {
        console.error('Error:', error.causa);
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
        console.error('Error al actualizar el carrito del usuario:', error.causa);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
