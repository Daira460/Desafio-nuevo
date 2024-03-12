const NewProductDto = require('../DTO/new-product.dto.js');
const Products = require('../DAO/models/products.model')

class ProductDao {

    async getProductByID(id) {
      try {
          return await Products.findOne({ _id: id, status: true })
      } catch (error) {
          console.log('Error al obtener el producto por ID:', error.message)
          throw error;
      } 
  }
    async addProduct(product) {
      try {
          const { title, description, price, thumbnail, code, stock, category } = product
          if (!title || !description || !price || !code || !stock || !category) {
            console.error ("Todos los campos son obligatorios. El producto no fue agregado.")
            return { success: false, message: "Todos los campos son obligatorios. El producto no fue agregado." }
          }

          const codeExist = await Products.findOne({ code: code})
          if (codeExist) {
            console.error (`El producto con code: ${code} ya existe. Por favor, seleccione otro.`)
            return { success: false, message: `El producto con code: ${code} ya existe. Por favor, seleccione otro.` }
          }

          const NewProductInfo = new NewProductDto(product)

          await Products.create(NewProductInfo)

          return { success: true }

      } catch (error) {
        console.error('Error al cargar productos:', error.message)
        return { success: false, message: 'Error interno al procesar la solicitud.' }
      }
    }

    async updateProduct(productUpdated) {
        try {
          await Products.findOneAndUpdate( {_id: productUpdated.id}, productUpdated )
          if (!productUpdated.id) {
            console.error("Producto no encontrado con ID:", productUpdated.id)
            throw new Error("Producto no encontrado")
          } 
          console.log("Producto actualizado correctamente:", productUpdated.id)
        } catch (error) {
          console.error("Error al actualizar el producto:", error.message)
          throw error
        }
      }
    async deleteProduct(id) {
      try {   
        const idExist = await Products.updateOne({ _id: id }, { $set: { status: false } })
        if (idExist) {
          console.log("Producto borrado correctamente")}
      } catch (error) {
        console.error("Error al borrar el producto:", error.message)
        return false
      }
    }
  }

module.exports = ProductDao



