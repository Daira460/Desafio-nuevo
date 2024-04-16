const { Router } = require('express');
const router = Router();
const passport = require('passport');
const UserService = require('../services/user.service');
const ErrorPersonalizado = require('../errores/Error-Personalizado');
const TiposErrores = require('../errores/tipos-errores');
const CodigosErrores = require('../errores/codigos_errores');

router.get('/user-cart', async (req, res, next) => {
    try {
        const cid = req.session.cart;
        if (!cid) {
            if (!req.user) {
                throw new ErrorPersonalizado.crearError({
                    nombre: TiposErrores.NO_AUTORIZADO,
                    causa: 'No estás autenticado',
                    mensaje: 'No estás autenticado',
                    codigo: CodigosErrores.NO_AUTORIZADO,
                });
            }
            const uid = req.user._id;
            const userCart = await UserService.getUserCart(uid);
            if (!userCart) {
                throw new ErrorPersonalizado.crearError({
                    nombre: TiposErrores.USUARIO_NO_EXISTE,
                    causa: 'No se encontró el usuario en la base de datos',
                    mensaje: 'El usuario no existe',
                    codigo: CodigosErrores.NO_ENCONTRADO,
                });
                
                return
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
        req.logger.error ('Error en la autenticacion de usuario:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
});

router.get('/fail-Register', (req, res) => {
    req.logger.info ('fallo el registro de usuario')
    res.status(400).json({status: 'error',  error: 'bad Request' })
});

router.put('/', async (req, res) => {
    try {
        const uid = req.user._id;
        const { cart: cid } = req.body;

        await UserService.updateUserCart(uid, cid);

        res.status(200).json({ status: 'success', message: 'User cart updated successfully' });
    } catch (error) {
        req.logger.error ('Error al actualizar el carrito del usuario:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
});router.put('/premium/:uid', async (req, res) => {
    try {
        const { uid } = req.params
        await UserService.toggleUserRole(uid)
        res.status(200).json({ status: 'success', message: 'Actualizacion del role es correcta' })
    } catch (error) {
        req.logger.error ('Error al cambiar el role del usuario:', error)
        res.status(500).json({ error: 'Error al modificar el nivel de autorización del usuario' });
    }
})


module.exports = router;
