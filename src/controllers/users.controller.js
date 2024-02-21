const { Router } = require('express')
const Users = require('../DAO/models/user.model')
const router = Router()
const passport = require ('passport')
router.get ('/user-cart', async (req, res) => {
    try {
          const cid = req.session.cart;
        if (!cid) {
            const uid = req.user._id;
            const user = await Users.findOne({_id: uid}).exec();
            const newCid = user.cart;
            req.session.cid = newCid;
            console.log ('el cid es:', newCid);
            res.status(200).json({status: 'success', cid: newCid});
        }
    } catch (error) {
        console.error('Error al actualizar el carrito del usuario:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post ('/', passport.authenticate('register', {failureRedirect: '/api/users/fail-Register'}),  async (req, res) => {
    try {
        res.status(201).json ({status: 'success', messae: 'Usuario' })
     } catch (error) {
        console.error ('Error:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.get ('/fail-Register', (req, res) => {
    console.log ('Fallo registro')
    res.status(400).json({status: 'error',  error: 'bad Request' })
})
router.put('/', async (req, res) => {
    try {
        const uid = req.user._id
        const { cart: cid } = req.body
        await Users.updateOne({_id: uid}, {cart: cid})
        req.session.user.cart = cid
          res.status(200).json({ status: 'success', message: 'User cart updated successfully' })
    } catch (error) {
        console.error('Error al actualizar el carrito del usuario:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


module.exports = router