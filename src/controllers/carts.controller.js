const { Router } = require('express')
const router = Router()
const CartService = require('../services/cart.service.js')
const ProductsService = require('../services/products.service.js')
const calculateSubtotalAndTotal = require('../utils/calculoTotales-Cart.util.js')
const authorization = require('../middlewares/authorization-middleware.js')
const NewPurchaseDTO = require('../DTO/new-purchase.dto.js')
const separateStocks = require('../utils/separateStocks.util')
const ErrorPersonalizado = require('../errores/Error-Personalizado');
const TiposErrores = require('../errores/tipos-errores');
const CodigosErrores = require('../errores/codigos_errores');


router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params
        const { user } = req.session

        const filterById = await CartService.getCartByID(cid)
        if (!filterById) {
            return res.status(404).json({ error: 'El carrito con el ID buscado no existe.' })
        } else {
            const { subtotal, total } = calculateSubtotalAndTotal(filterById.products)
            res.render('cart', {
                user,
                subtotal,
                filterById,
                total,
                style: 'style.css',
            })
        }
    } catch (error) {
        console.error('Error al obtener el carrito:', error.causa)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


router.get('/:cid/purchase', async (req, res) => {
    try {
        const { cid } = req.params
        const { user } = req.session
        const { total, orderNumber } = req.query
        const filterById = await CartService.getCartByID(cid)
        if (!filterById || !user) {
            return res.status(404).json({ error: 'Error a ver la orden de compra.' })
        }
        res.render('ticket', {
            user,
            total,
            orderNumber,
            style: 'style.css',
        })
    } catch (error) {
        console.error('Error al obtener el ticket:', error.causa)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.post('/', async (req, res) => {
    try {
        const result = await CartService.addCart()
        res.status(201).json({ message: 'Carrito creado correctamente', cid: result.cid })
    } catch (error) {
        console.error('Error al cargar productos:', error.causa)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


router.post('/:cid/products/:pid', authorization('user'), async (req, res, next) => {
    try {
        const { cid, pid } = req.params
        const product = await ProductsService.getProductByID(pid)

        if (!product) {
            throw new ErrorPersonalizado({
                nombre: TiposErrores.PRODUCTO_NO_ENCONTRADO,
                causa: 'El producto con el ID proporcionado no existe.',
                mensaje: 'El producto con el ID proporcionado no existe.',
                codigo: CodigosErrores.NO_ENCONTRADO,
            })
        }

        const result = await CartService.addProductInCart(cid, pid)
        if (result.success) {
            req.session.user.cart = cid
            res.status(201).json({ mensaje: result.message })
        } else {
            throw new ErrorPersonalizado({
                nombre: TiposErrores.ERROR_SERVIDOR_INTERNO,
                causa: 'Error al agregar el producto al carrito.',
                mensaje: result.message,
                codigo: CodigosErrores.ERROR_SERVIDOR_INTERNO,
            })
        }
    } catch (error) {
        next(error)
    }
})


router.post('/:cid/purchase', async (req, res) => {
    try {
        const { cid } = req.params
        const { user } = req.session
        const filterById = await CartService.getCartByID(cid)
        if (!filterById) {
            return res.status(404).json({ error: 'El carrito con el ID buscado no existe.' })
        }

        const { productsInStock, productsOutOfStock } = separateStocks(filterById.products)

        await ProductsService.updateStock(productsInStock)

        const updatedCart = await CartService.updateCart(cid, productsOutOfStock)
        if (!updatedCart.success) {
            return res.status(500).json({ error: updatedCart.message })
        }

        const { total } = calculateSubtotalAndTotal(productsInStock)
        const NewTicketInfo = new NewPurchaseDTO(total, user)
        const order = await CartService.createPurchase(NewTicketInfo)
        const orderNumber = order.createdOrder.code
        res.status(201).json({
            message: 'ticket creado correctamente',
            total: total,
            orderNumber: orderNumber,
        })
    } catch (error) {
        console.error('Error al crear una orden:', error.causa)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


router.put('/:cid/products/:pid', authorization('user'), async (req, res) => {
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
        console.error('Error al actualizar la cantidad del producto:', error.causa)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.delete('/:cid/products/:pid', authorization('user'), async (req, res) => {
    try {
        const { cid, pid } = req.params
        const result = await CartService.deleteProductInCart(cid, pid)

        if (result.success) {
            res.status(201).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error.causa)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.delete('/:cid', authorization('user'), async (req, res) => {
    try {
        const { cid } = req.params
        const result = await CartService.deleteProductsInCart(cid)

        if (result.success) {
            res.status(201).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    } catch (error) {
        console.error('Error al eliminar los productos:', error.causa)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

module.exports = router



