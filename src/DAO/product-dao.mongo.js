const NewProductDto = require('../DTO/new-product.dto')
const Products = require('./models/products.model')

class ProductDao {

    async getProductByID(id) {
      try {
          return await Products.findOne({ _id: id, status: true })
      } catch (error) {
          console.log('Error al obtener el producto por ID:', error.message)
          throw error 
      } 
  }


    async addProduct(product) {
      try {
          const { code } = product
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
        return { success: false, message: 'Error interno al procesar tu solicitud.' }
      }
    }

    async updateProduct(productUpdated) {
        try {
          await Products.findOneAndUpdate( {_id: productUpdated.id}, productUpdated )
          if (!productUpdated.id) {
            console.error("Producto no encontrado con el ID:", productUpdated.id)
            throw new Error("El producto no fue encontrado")
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
                console.log("El producto fue borrado correctamente")
                return { success: true }
            }

            console.error("El producto no existe con ID:", id)
            return { success: false, message: 'El producto no existe.' }
        } catch (error) {
            console.error("Error al borrar el producto:", error.message)
            return { success: false, message: 'Error interno al procesar la solicitud.' }
        }
    }
    

  async updateStock(productsInStock) {
    try {
        for (const product of productsInStock) {
    
            const productId = product.product._id
            const quantity = product.quantity

            const foundProduct = await Products.findById(productId)

            if (!foundProduct) {
                throw new Error(`Producto con ID ${productId} no encontrado`)
            }

            foundProduct.stock -= quantity

            await foundProduct.save()
            console.log(`Stock del producto ${foundProduct.title} fue actualizado correctamente`)
        }

        console.log('Todos los stocks actualizados correctamente')
    } catch (error) {
        console.error('Error al actualizar el stock:', error)
    }
  }

}


module.exports = ProductDao



