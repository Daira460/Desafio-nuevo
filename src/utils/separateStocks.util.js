function separateStocks(products) {
    
    const productsInStock = []
    const productsOutOfStock = []

    products.forEach(product => {
        if (product.product.stock > product.quantity) {
            productsInStock.push(product)
        } else {
            productsOutOfStock.push(product)
        }
    })

    return { productsOutOfStock , productsInStock}
}


module.exports = separateStocks