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

    return { productsInStock, productsOutOfStock }
}


module.exports = separateStocks