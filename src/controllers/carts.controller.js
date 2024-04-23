const { Router } = require('express')
const router = Router()
const ProductsService = require('../services/products.service.js')
const calculateSubtotalAndTotal = require('../utils/calculoTotales-Cart.util.js')
const CartService = require('../services/cart.service.js')
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
        req.logger.error ('Error al obtener el carrito:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
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
        req.logger.error ('Error al obtener el ticket ya creado:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.post('/', async (req, res) => {
    try {
        const result = await CartService.addCart()
        res.status(201).json({ message: 'Carrito creado correctamente', cid: result.cid })
    } catch (error) {
        req.logger.error ('Error al cargar los productos:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})


router.post('/:cid/products/:pid', authorization('user', 'premium'), async (req, res, next) => {
    try {
        const { cid, pid } = req.params
        const product = await ProductsService.getProductByID(pid)

        if (!product) {
            throw new ErrorPersonalizado.crearError({
                nombre: TiposErrores.PRODUCTO_NO_ENCONTRADO,
                causa: 'El producto con el ID proporcionado no existe.',
                mensaje: 'El producto con el ID proporcionado no existe.',
                codigo: CodigosErrores.NO_ENCONTRADO,
            })
        }
        if (product.owner === req.session.user.email) {
            return res.status(401).json({ error: 'bad request'})
        }

        const result = await CartService.addProductInCart(cid, pid)
        if (result.success) {
            req.session.user.cart = cid
            res.status(201).json({ mensaje: result.message })
        } else {
            throw new ErrorPersonalizado.crearError({
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
        req.logger.error ('Error:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})


router.put('/:cid/products/:pid', authorization('user', 'premium'), async (req, res) => {
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
        req.logger.error ('Error al actualizar la cantidad de productos:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.delete('/:cid/products/:pid', authorization(['user', 'premium']), async (req, res) => {
    try {
        const { cid, pid } = req.params
        const result = await CartService.deleteProductInCart(cid, pid)

        if (result.success) {
            res.status(200).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    }catch (error) {
        req.logger.error ('Error al eliminar un producto:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.delete('/:cid', authorization(['user', 'premium']), async (req, res) => {
    try {
        const { cid } = req.params
        const result = await CartService.deleteProductsInCart(cid)

        if (result.success) {
            res.status(200).json({ message: result.message })
        } else {
            res.status(500).json({ error: result.message })
        }
    }  catch (error) {
        req.logger.error ('Error al eliminar todos los productos:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

module.exports = router



