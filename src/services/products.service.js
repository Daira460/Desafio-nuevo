const ProductRepository = require ('../Repositories/product.repository');
const productRepository = new ProductRepository();

const getProductByID = async pid => {
    try {
        const findID = await productRepository.getProductByID(pid);
        return findID;
    } catch (error) {
        throw error;
    } 
};

const addProduct = async product => {
    try {
        const result = await productRepository.addProduct(product); 
        return result;
    } catch (error) {
        throw error;
    }  
};

const updateProduct = async productUpdated => {
    try {
        await productRepository.updateProduct(productUpdated); 
    } catch (error) {
        throw error;
    }  
};

const deleteProduct = async pid => {
    try {
        const result = await productRepository.deleteProduct(pid); 
        return result;
    } catch (error) {
        throw error;
    }  
};
 
const updateStock = async productsInStock => {
    try {
        const result = await productRepository.updateStock(productsInStock); 
        return result;
    } catch (error) {
        throw error;
    }  
};
 
module.exports = {
    getProductByID,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock
};
