const { Router } = require('express');
const router = Router();
const ProductsService = require('../services/products.service.js');
const { getProducts } = require('../utils/products.util');
const authorization = require('../middlewares/authorization-middleware.js');
const ErrorPersonalizado = require('../errores/Error-Personalizado');
const TiposErrores = require('../errores/tipos-errores');
const generateProductErrorDetails = require('../errores/generateProductErrorDetails');
const CodigosErrores = require('../errores/codigos_errores');
const generateProducts = require('../utils/products-mocks.util');

router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, category, stock } = req.query;
        const { docs, hasPrevPage, hasNextPage, nextPage, prevPage, totalPages } = await getProducts({ limit, page, sort, category, stock });
        if (totalPages && parseInt(page) > totalPages) {
            return res.redirect(`/api/products?page=${totalPages}`);
        }
        const products = docs;
        const { user } = req.session;
        res.render('home', {
            user,
            products,
            hasPrevPage,
            hasNextPage,
            nextPage,
            prevPage,
            limit,
            sort,
            style: 'style.css',
        });
    }  catch (error) {
        req.logger.error ('Error:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
});

router.get('/mockingproducts', async (req, res) => {
    try {
        const products = generateProducts()
        res.render('home', {
            products,
            style: 'style.css',
        })
    } catch (error) {
        req.logger.error ('Error al obtener los productos:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
})

router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const { user } = req.session;
        const productFilter = await ProductsService.getProductByID(pid);
        if (!productFilter) {
            return res.status(404).json({ error: 'El producto con el id buscado no existe.' });
        }
        res.render('productFilter', {
            user,
            productFilter,
            pid,
            style: 'style.css',
        });
    } catch (error) {
        req.logger.error ('Error al obtener el producto:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
});

router.post("/", authorization(['admin', 'premium']), async (req, res, next) => {
    try {
        const { code, description, price, stock, thumbnail, title, category } = req.body;
        if (!title || !description || !code || !price || !stock || !category) {
            ErrorPersonalizado.crearError({
                nombre: TiposErrores.ERROR_AL_CREAR_PRODUCTO,
                causa: generateProductErrorDetails({ title, description, code, price, stock, category }),
                mensaje: 'Error al crear el producto',
                codigo: CodigosErrores.ERROR_AL_CREAR_PRODUCTO,
            });
           
           
            return
        }
          if (req.session.user.role === 'premium') {
             const owner = req.session.user.email
             const result = await ProductsService.addProduct({code,description,price,stock,thumbnail,title,category,owner})
             if (result.success) {
               res.status(201).json({ status: 'Success', message: "Producto creado por el usuario premium correctamente" })
             } else {
               res.status(400).json({ error: result.message })
             }
             return
          } 
          const result = await ProductsService.addProduct({code,description,price,stock,thumbnail,title,category})
          if (result.success) {
            res.status(201).json({ status: 'Success', message: "Producto creado por el admin correctamente" })
          } else {
            res.status(400).json({ error: result.message })
          }
          return
        } catch (error) {
            next(error)
        }
    })
    

router.put('/:pid', authorization('admin'), async (req, res) => {
    try {
        const { pid } = req.params;
        const { ...product } = req.body;
        if (!product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
            return res.status(404).json({ error: "Todos los campos son obligatorios. El producto no fue agregado." });
        }
        await ProductsService.updateProduct({ ...product, id: pid });
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        req.logger.error ('Error:', error)
        res.status(500).json({ error: 'Error al actualizar el producto.' })
    }
});

router.delete('/:pid', authorization(['admin', 'premium']), async (req, res) => {
    try {
        const { pid } = req.params;
        if (req.session.user.role === 'premium') {
            const productFilter =  await ProductsService.getProductByID(pid)
            if (!productFilter) {
                return res.status(404).json({status: 'failure', error: 'El producto con el id que esta buscando no existe.'})
            }  if (productFilter.owner === req.session.user.email) {

                const result = await ProductsService.deleteProduct(pid)
                if (result === false) {

                    return res.status(404).json({ error: 'El producto con el id que esta buscado no existe.'})
                } else {
                    res.json({status: 'Success', message: 'Producto borrado correctamente por el usuario premium' })
                }  
            } else {
                return res.status(401).json({status: 'failure', error: 'No puede borrar productos que sean de otro usuario.'})
            }
        } else {
            const result = await ProductsService.deleteProduct(pid)
            if (result === false) {
                return res.status(404).json({ error: 'El producto con el id que esta buscado no existe.'})
            } else {
                res.json({ status: 'Success', message: 'El producto fue borrado correctamente por el admin' })
            }

        }
    } catch (error) {
        req.logger.error ('Error:', error)
        res.status(500).json({ error: 'Error al borrar un producto.' })
    }
})

module.exports = router;

