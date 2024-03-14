const NewTicketDto = require("../DTO/new-ticket.dto");
const NewProductDto = require('../DTO/new-product.dto')
const productsService = require('../services/products.service')
const cartsService = require('../services/cart.service');
const Ticket = require("../DAO/models/ticket.model");

const purchase = async (cartId,cid,email) => {
    try {
        
        const productsNotPurchased = [];
        cartId.map(prod => {
            const product = prod.product;
            const quantityInCart = prod.quantity;
            
            if(product.stock < quantityInCart){
                productsNotPurchased.push(prod._id);
            }
        })
        if(productsNotPurchased.length > 0) {
            const productsPurchased = cartId.filter(item => !productsNotPurchased.includes(item._id))

            const totalAmount = productsPurchased.reduce((total, item) => {
                return total + (item.product.price * item.quantity);
            }, 0);

            
            productsPurchased.map(async(prod) => {
                const product = prod.product;
                const quantityInCart = prod.quantity;
                const updatedAt = new Date()
                
                product.stock -= quantityInCart  
                
                const productInfo = new NewProductDto(product, updatedAt)
                
                await productsService.updateOne(product._id, productInfo)
                
            })
            
            const cartToUpdate = cartId.filter(item => productsNotPurchased.includes(item._id))
            
            await cartsService.updateCart(cid, cartToUpdate)
            
            const newTicketInfo = new NewTicketDto(totalAmount, email)
            
            const newTicket = await Ticket.create(newTicketInfo)

            return { newTicket, cartToUpdate }
           
        }

    } catch (error) {
        throw error
    }
} 



module.exports = {
    purchase,
}