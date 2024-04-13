const Carts = require('./models/carts.model')
const Tickets = require ('./models/purchase.model.js')
const ProductsService = require ('../services/products.service.js')
const mongoose = require('mongoose')


class CartDao {

    async addCart() {
        try {
            const newCart = {
                products: []
            }
    
            const createdCart = await Carts.create(newCart)
            const cartId = createdCart._id
            console.log ('El cart id es:', cartId)
    
            return { success: true, message: 'Carrito creado correctamente', cid: cartId }
        } catch (error) {
            console.error('Error al crear el carrito:', error.message)
            return { success: false, message: 'Error interno al procesar la solicitud.' }
        }
    }

    async getCartByID (id) {
        try {
          const findCart = await Carts.findOne({ _id: id}).populate('products.product')
          if (findCart) return findCart
        } catch (error) {
            console.log ('Error al obtener los productos del carrito:', error.message)
          } 
      }

    
    async addProductInCart(cid, pid) {
        try {

            const cart = await Carts.findById(cid)

            if (cart) {

                const product = await ProductsService.getProductByID(pid)

                if (product) {

                    const productIndex = cart.products.findIndex(prod => prod.product.toString() === pid.toString())

                    if (productIndex !== -1) {
     
                        cart.products[productIndex].quantity++
                    } else {
  
                        cart.products.push({ product: new mongoose.Types.ObjectId(pid), quantity: 1 })
                    }


                    await cart.save()
                    console.log('Producto agregado al carrito con éxito')
                    return { success: true, message: 'Producto agregado correctamente al carrito' }
                } else {
                    console.log('El producto no existe en la base de datos')
                    return { success: false, message: 'El producto no existe en la lista general de productos.' }
                }
            } else {
                console.log('El carrito no existe en la base de datos')
                return { success: false, message: 'carrito no encontrado.' }
            }
        } catch (error) {
            console.error('Error al agregar el producto al carrito:', error)
            return { success: false, message: 'Error interno del servidor' }
        }
    }

    async updateCart(cid, productsOutOfStock) {
        try {

            const cart = await Carts.findById(cid)
    
            if (cart) {

                cart.products = []
 
                productsOutOfStock.forEach(product => {
                    cart.products.push({
                        product: new mongoose.Types.ObjectId(product.product._id),
                        quantity: product.quantity
                    })
                })

                await cart.save()
                
                console.log('Carrito actualizado con productos sin stock')
                return { success: true, message: 'Carrito actualizado con productos sin stock' }
            } else {
                console.log('El carrito no existe en la base de datos')
                return { success: false, message: 'Carrito no encontrado.' }
            }
        } catch (error) {
            console.error('Error al actualizar el carrito:', error)
            return { success: false, message: 'Error interno del servidor' }
        }
    }
    

  async updateProductQuantity(cid, pid, quantity) {
    try {
        const cart = await Carts.findById(cid)

        if (cart) {
            const productIndex = cart.products.findIndex(prod => prod.product.toString() === pid.toString())

            if (productIndex !== -1) {

                cart.products[productIndex].quantity = quantity

                await cart.save()
                console.log('Cantidad de producto actualizada con éxito')
                return { success: true, message: 'Cantidad de producto actualizada correctamente' }
            } else {
                console.log('El producto no está en el carrito')
                return { success: false, message: 'El producto no está en el carrito.' }
            }
        } else {
            console.log('El carrito no existe en la base de datos')
            return { success: false, message: 'Carrito no encontrado.' }
        }
    } catch (error) {
        console.error('Error al actualizar la cantidad del producto:', error)
        return { success: false, message: 'Error interno del servidor' }
    }
}
        

    async deleteProductInCart(cid, pid) {
        try {
            const cart = await Carts.findById(cid)

            if (cart) {

                const productIndex = cart.products.findIndex(prod => prod.product.toString() === pid.toString())

                if (productIndex !== -1) {
                    cart.products.splice(productIndex, 1)


                    await cart.save()
                    console.log('Producto eliminado del carrito con éxito')
                    return { success: true, message: 'Producto eliminado correctamente del carrito' }
                } else {
                    console.log('El producto no está en el carrito')
                    return { success: false, message: 'El producto no está en el carrito.' }
                }
            } else {
                console.log('El carrito no existe en la base de datos')
                return { success: false, message: 'Carrito no encontrado.' }
            }
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error)
            return { success: false, message: 'Error interno del servidor' }
        }
    }
        
  async deleteProductsInCart(cid) {
    try {
        const cart = await Carts.findById(cid)

        if (cart) {

            cart.products = []

            await cart.save()
            console.log('Productos eliminados del carrito con éxito')
            return { success: true, message: 'Productos eliminados correctamente del carrito' }
        } else {
            console.log('El carrito no existe en la base de datos')
            return { success: false, message: 'Carrito no encontrado.' }
        }
    } catch (error) {
        console.error('Error al eliminar el producto del carrito:', error)
        return { success: false, message: 'Error interno del servidor' }
    }
  }

  async createPurchase(NewPurchaseDTO) {
    try {
        const createdOrder = await Tickets.create(NewPurchaseDTO)
        return { success: true, message: 'ticket creado correctamente', createdOrder}
    } catch (error) {
        console.error('Error al crear el ticket', error.message)
        return { success: false, message: 'Error interno al procesar la solicitud.' }
    }
}

}




module.exports = CartDao
