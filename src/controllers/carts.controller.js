const { Router } = require('express')
const router = Router()
const ProductsService = require ('../services/products.service.js')
const CartService = require ('../services/cart.service.js')
const calculateSubtotalAndTotal = require('../utils/calculoTotales-Cart.util.js')

//carrito
router.post('/', async (req, res) => {
    try {
        const result = await CartService.addCart() 
        res.status(201).json({ message: 'Carrito creado correctamente', cid: result.cid })
    } catch (error) {
        console.error('Error al cargar productos:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const { user } = req.session

        const filterById =  await CartService.getCartByID(cid)
        if (!filterById) {
            return res.status(404).json({ error: 'El carrito con el ID buscado no existe.'})
        } else {

            const { subtotal, total } = calculateSubtotalAndTotal(filterById.products)
              res.render ('cart', { 
                user,
                subtotal,
                filterById,
                total,
                style: 'style.css',})
        }
    } catch (error) {
        console.error ('Error al obtener el carrito:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const product = await ProductsService.getProductByID(pid)

        if (!product) {
            return res.status(404).json({ error: 'El producto con el ID proporcionado no existe.' })
        }
        const result = await CartService.addProductInCart(cid, pid)
        if (result.success) {
            req.session.user.cart = cid
            res.status(201).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    } catch (error) {
        console.error('Error al cargar productos:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const { products } = req.body

        const result = await CartService.updateCart(cid, products)

        if (result.success) {
            res.status(201).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    } catch (error) {
        console.error('Error al actualizar los productos del carrito:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const { quantity } = req.body

        const result = await CartService.updateProductQuantity(cid, pid, quantity)

        if (result.success) {
            res.status(200).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
        } catch (error) {
            console.error('Error al actualizar la cantidad del producto:', error.message)
            res.status(500).json({ error: 'Internal Server Error' })
        }
})


router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params
        const result = await CartService.deleteProductInCart(cid, pid)

        if (result.success) {
            res.status(201).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const result = await CartService.deleteProductsInCart(cid)

        if (result.success) {
            res.status(201).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    } catch (error) {
        console.error('Error al eliminar los productos:', error.message)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


module.exports = router
 
 