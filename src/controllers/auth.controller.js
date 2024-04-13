const { Router } = require('express');
const Users = require('../DAO/models/user.model');
const { createHash, useValidPassword } = require('../utils/cryp-password.util');
const passport = require('passport');
const router = Router();
const SensibleDTO = require('../DTO/sensible-user');
const transport = require('../utils/nodemailer.util');
const { userEmail } = require('../config/server.config');
const { createToken } = require('../utils/jwt.util');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/server.config');
const { error } = require('winston');

router.post('/', passport.authenticate('login', { failureRedirect: '/auth/fail-login' }), async (req, res) => {
    try {
        const { email } = req.body;
        const lowercaseEmail = email.toLowerCase();

        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: lowercaseEmail,
            age: req.user.age,
            role: req.user.role,
            cart: req.user.cart,
        };
        res.json({ status: 'success', message: 'Login Succesfull' });
    } catch (error) {
        req.logger.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/current', (req, res) => {
    if (req.isAuthenticated()) {
        const userDTO = new SensibleDTO(req.user);
        res.json({ message: userDTO });
    } else {
        res.status(401).json({ status: 'error', message: 'User is not authenticated' });
    }
});


router.get('/fail-login', (req, res) => {
    console.log('Fallo el logueo');
    res.status(400).json({ status: 'error', error: 'bad Request' });
});

router.get('/logout', async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ error: 'Error interno del servidor' });
            } else {
                return res.status(200).json({ message: 'Logout successful' });
            }
        });
    } catch (error) {
        req.logger.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/forgotPassword', async (req, res) => {
    try {
        const token = req.body.token;
        const decodedToken = jwt.verify(token, jwtSecret);
        const email = decodedToken.email;

        const { password } = req.body;
        const passwordEncrypted = createHash(password);

        const user = await Users.findOne({ email });
        if (useValidPassword(user, password)) {
            return res.status(400).json({ error: 'Contraseña inválida', message: 'La nueva contraseña debe ser diferente a la contraseña actual' });
        }

        await Users.updateOne({ email }, { password: passwordEncrypted });

        res.status(200).json({ status: 'Éxito', message: 'Contraseña actualizada' });
    } catch (error) {
        req.logger.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/recoveryKey', async (req, res) => {
    try {
        const { email } = req.body;
        const userExist = await Users.findOne({ email });

        if (userExist) {
            const TokenInfoUser = {
                email: userExist.email,
            };

            const token = createToken(TokenInfoUser);

            const recoveryLink = `http://localhost:3000/forgotPassword?token=${token}`;

            transport.sendMail({
                from: userEmail,
                to: userExist.email,
                subject: 'Restablece tu Contraseña en GreenBite',
                html: `
                    <h1>Buenas ${userExist.first_name}</h1>
                    <p style="margin-bottom: 20px;">Has solicitado restablecer tu contraseña en GreenBite.</p>
                    <p>Por favor, presiona sobre el botón para cambiar contraseña. Este enlace solo será válido durante 1 hora.</p>
                    <a id="recoveryLink" href="${recoveryLink}" style="background-color: #4CAF59; color: violet; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; display: inline-block;">Restablecer Contraseña</a>
                `,
            });

            res.status(200).json({ status: 'Éxito', message: 'El correo se encuentra registrado' });
        } else {
            res.status(404).json({ status: 'Error', message: 'El correo no está registrado' });
        }
    } catch (error) {
        req.logger.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.get('/github', passport.authenticate('github', { scope: ['user: email'] }, (req, res) => { }));

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/api/products');
    }
);

module.exports = router;
