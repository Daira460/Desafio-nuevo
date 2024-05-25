const { Router } = require('express');
const router = Router();
const passport = require('passport');
const UserService = require('../services/user.service');
const ErrorPersonalizado = require('../errores/Error-Personalizado');
const TiposErrores = require('../errores/tipos-errores');
const CodigosErrores = require('../errores/codigos_errores');
const upload  = require('../middlewares/multer')
const authMiddleware = require('../middlewares/Private-acces-middleware')
const SensibleDTO = require ('../DTO/sensible-user')
const authorization = require('../middlewares/authorization-middleware')


router.get('/', authorization(['admin']), async (req,res,next) => {
    try {
        const users = await UserService.getUsers()
        const userDTO = new SensibleDTO(users)
        res.json({ userDTO })
    } catch (error) {
        next(error)
    }
})

router.get('/user-cart', async (req, res, next) => {
    try {
        const cid = req.session.cart;
        if (!cid) {
            if (!req.user) {
                throw new ErrorPersonalizado.crearError({
                    nombre: TiposErrores.NO_AUTORIZADO,
                    causa: 'No estás autenticado',
                    mensaje: 'No estás autenticado',
                    codigo: CodigosErrores.NO_AUTORIZADO,
                });
            }
            const uid = req.user._id;
            const userCart = await UserService.getUserCart(uid);
            if (!userCart) {
                throw new ErrorPersonalizado.crearError({
                    nombre: TiposErrores.USUARIO_NO_EXISTE,
                    causa: 'No se encontró el usuario en la base de datos',
                    mensaje: 'El usuario no existe',
                    codigo: CodigosErrores.NO_ENCONTRADO,
                });
                
                return
            }
            res.status(200).json({ estado: 'éxito', cid: userCart });
        }
    } catch (error) {
        next(error);
    }
});

router.get ('/documents', authMiddleware , async (req, res) => {
    try {
        const user = req.user
        res.render ('documents', { 
            user,
            style: 'style.css',})
     } catch (error) {
        req.logger.error (error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
router.get ('/fail-Register', (req, res) => {
    req.logger.info ('Error al registrar usuario')
    res.status(400).json({status: 'error',  error: 'bad Request' })
})

router.post('/', passport.authenticate('register', { failureRedirect: '/api/users/fail-Register' }), async (req, res) => {
    try {
        res.status(201).json({ status: 'success', message: 'Usuario' });
    } catch (error) {
        req.logger.error ('Error en la autenticacion de usuario:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
});

router.post("/:uid/documents", upload.single("myFile"), async (req, res) => {
    try {
      const file = req.file
      const { uid } = req.params
      if (!file) {
        res.status(500).send("Error al subir el documento")
      } else {
        const result = await UserService.uploadImage(uid, file)
        if (result) res.status(200).send("Documento Cargado con Exito")
          else {
              res.status(500).send("Error al procesar la carga del documento.")
            }
      }
    } catch (error) {
      req.logger.error("Error al subir el documento:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  })
  
  router.post('/:uid/documents/multiple', upload.array('myFiles'), async (req, res) => {
      try {
          const files = req.files
          const { uid } = req.params
          if (!files) {
            res.status(500).send("Fallo al cargar los documentos")
          } else {
            const result = await UserService.uploadImages(uid, files)
            if (result) res.status(200).send("Documentos cargados con exito")
              else {
                  res.status(500).send("Error al procesar la carga del documento.")
                }
          }
      } catch (error) {
          req.logger.error("Fallo al cargar los documentos:", error)
          res.status(500).json({ error: "Internal Server Error" })
      }
  })

router.put('/', async (req, res) => {
    try {
        const uid = req.user._id;
        const { cart: cid } = req.body;

        await UserService.updateUserCart(uid, cid);

        res.status(200).json({ status: 'success', message: 'User cart updated successfully' });
    } catch (error) {
        req.logger.error ('Error al actualizar el carrito del usuario:', error)
        res.status(500).json({ error: 'Error interno del servidor' })
    }
});
router.put('/premium/:uid', authorization(['admin']) , async (req, res) => {
    try {
        const { uid } = req.params
        const requiredDocuments = ['Identificacion', 'Comprobantededomicilio', 'Comprobantedeestadodecuenta']
        // nos traemos los documentos cargados en el usuario y los formateamos
        const user = await UserService.findByIdDocuments(uid)
        const userDocuments = user.documents.map(doc => {
            // Utilizamos una expresión regular para eliminar el timestamp y la extensión del nombre del documento
            const fileNameWithoutExtension = doc.name.replace(/\d+-/, '').replace(/\..+$/, '')
            return fileNameWithoutExtension
        })
        //verifico que documentos hay cargados
        const documentsUploaded = requiredDocuments.every(doc => userDocuments.includes(doc))
        if (user.role === 'premium') {
            await UserService.toggleUserRole(uid)
            res.status(200).json({ status: 'success', message: 'El usuario vuelve a ser role User'})
        } else if (documentsUploaded) {
            // Cambiar el rol del usuario a premium
            await UserService.toggleUserRole(uid)
            res.status(200).json({ status: 'success', message: 'Usuario convertido en Premium' })
        } else {
            res.status(400).json({ error: 'El usuario no ha terminado de procesar su documentación.' })
        }
    } catch (error) {
        req.logger.error ('Error al cambiar el role del usuario:', error)
        res.status(500).json({ error: 'Error al cambiar el rol del usuario.' })
    }
})
router.delete('/', authorization(['admin']) , async (req, res) => {
    try {
    const users = await UserService.getUsers()
    const result = await UserService.deleteUsers(users)
    
    if (result.status === 'success') {
        res.status(200).json({ status: 'success', message: 'Usuarios inactivos eliminados correctamente' })
        }
        else {
            res.status(400).json({ status: 'Error', message: 'No hay usuarios inactivos' })
        }
    } catch (error) {
        req.logger.error ('Error al borrar usuarios:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


module.exports = router;
