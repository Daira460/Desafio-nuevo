const { Router } = require('express')
const router = Router()
const ProductsService = require ('../services/products.service.js')
const { getProducts } = require('../utils/products.util')
const authorization = require('../middlewares/authorization-middleware.js')


router.get('/', async (req, res) => {
try {
    const { limit, page, sort, category, stock } = req.query

    const { docs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages } = await getProducts({ limit, page, sort, category, stock })

    if (totalPages && parseInt(page) > totalPages) {
        return res.redirect(`/api/products?page=${totalPages}`)
    }
    const products = docs
    const { user } = req.session

if (totalPages && parseInt(page) > totalPages) {
return res.redirect(`/api/products?page=${totalPages}`)

}

 res.render ('home', { 
    user,
    products,
    hasPrevPage,
    hasNextPage,
    nextPage,
    prevPage,
    limit,
    sort,
     style: 'style.css',})
} catch (error) {
    console.error ('Error al obtener los products:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
}
})

router.get('/:pid', async (req, res) => {
try {
    const { pid } = req.params
    const { user } = req.session
const productFilter =  await ProductsService.getProductByID(pid)

    if (!productFilter) {
        return res.status(404).json({ error: 'El producto con el id buscado no existe.'})
    }   res.render ('productFilter', { 
        user,
        productFilter,
        pid,
         style: 'style.css',}) 
} catch (error) {
    console.error ('Error al obtener los products:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
}
})

router.post("/", authorization('admin'), async (req, res) => {
    try {
      const { code, description, price, stock, thumbnail, title, category } = req.body
      const result = await ProductsService.addProduct({code,description,price,stock,thumbnail,title,category})
  
      if (result.success) {
        res.status(201).json({ message: "Producto creado correctamente" })
      } else {
        res.status(400).json({ error: result.message })
      }
      return
    } catch (error) {
      console.error("Error al cargar productos:", error.message)
      res.status(500).json({ error: "Internal Server Error" })
    }
  })

  router.put('/:pid', authorization('admin'), async (req, res) => {
    try {
        const { pid } = req.params
        const { ...product } = req.body

        if (!product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
            return res.status(404).json ({error: "Todos los campos son obligatorios. Producto no agregado."})
          }

        await ProductsService.updateProduct({ ...product, id: pid })
        res.json({ message: 'Producto Actualizado correctamente' })
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto.' })
    }
})


router.delete ('/:pid', authorization('admin'), async (req, res) => {
    try {
        const { pid } = req.params
        const result = await ProductsService.deleteProduct(pid)
        if (result === false) {
            return res.status(404).json({ error: 'El producto con el id buscado no existe.'})
        } else {
            res.json({ message: 'Producto borrado correctamente' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al borrar un producto.' })
    }
})



module.exports = router 
