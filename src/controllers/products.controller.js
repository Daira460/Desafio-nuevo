const { Router } = require('express')
const router = Router()
const ProductManager = require ('../DAO/productManagerDb')
const productManager = new ProductManager()
const Products = require('../DAO/models/products.model')

router.get('/', async (req, res) => {
try {
 
 const { limit , page = 1, sort, category, stock} = req.query

const limitValue = limit ? parseInt(limit) : 10

 const { docs, hasPrevPage, hasNextPage, nextPage, prevPage,totalPages} = await Products.paginate (
        {$and:[ 
            { status: true},
            { category: category ? { $eq: category } : { $exists: true } },
            { stock: stock ? { $eq: stock } : { $exists: true }} //cantidad de stock
        ]
        }, 
        {   page,
            limit:limitValue,
            lean:true,
            sort: sort === 'desc' ? { price: -1 } : sort === 'asc' ? { price: 1 } : undefined}
    )

 const products = docs
 const { user } = req.session

if (totalPages && parseInt(page) > totalPages) {
return res.redirect(`/api/products?page=${totalPages}`);
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
    const filterById =  await productManager.getProductByID(pid)
    if (!filterById) {
        return res.status(404).json({ error: 'El producto con el id buscado no existe.'})
    } else {
        res.json ({filterById})
    }
} catch (error) {
    console.error ('Error al obtener los products:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
}
})

router.post("/", async (req, res) => {
try {
  const { code, description, price, stock, thumbnail, title, category } = req.body
  const result = await productManager.addProduct({code,description,price,stock,thumbnail,title,category})

  if (result.success) {
    res.status(201).json({ message: "Producto creado correctamente" })
    const productData = {code,description,price,stock,thumbnail,title,category}
    req.app.locals.io.emit("newProduct", { data: productData })
  } else {
    res.status(400).json({ error: result.message })
  }
  return
} catch (error) {
  console.error("Error al cargar productos:", error.message)
  res.status(500).json({ error: "Internal Server Error" })
}
})

router.put('/:pid', async (req, res) => {
try {
    const { pid } = req.params
    const { ...product } = req.body
    if (!product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
        return res.status(404).json ({error: "Todos los campos son obligatorios. Producto no agregado."})
      }
    await productManager.updateProduct({ ...product, id: pid })
    res.json({ message: 'Producto Actualizado correctamente' })
} catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto.' })
}
})

router.delete ('/:pid', async (req, res) => {
try {
    const { pid } = req.params
    const result = await productManager.deleteProduct(pid)
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
