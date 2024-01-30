const { Router } = require('express')
const authMiddleware = require('../middlewares/Private-acces-middleware')
const router = Router()

router.get('/login', async (req, res) => {
    try {
     res.render ('login', {style:'style.css'})   
    } catch (error) {
        console.error ('Error:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.get('/signup', async (req, res) => {
    try {
     res.render ('signup', {style:'style.css'})   
    } catch (error) {
        console.error ('Error:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const { user } = req.session
        res.render ('profile', { user , style:'style.css'})   
    } catch (error) {
        console.error ('Error:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }})


module.exports = router