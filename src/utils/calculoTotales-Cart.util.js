const calculateSubtotalAndTotal = (products) => {

    const subtotal = products.map(product => product.quantity * product.product.price)


    const total = subtotal.reduce((acc, subtotal) => acc + subtotal, 0)
    
    return { subtotal, total }
}

module.exports = calculateSubtotalAndTotal