const multer = require('multer')

const destination = function (req, file, cb) {
    let folder

const fileType = req.body.fileType

switch (fileType) {
    case 'profileImage':
        folder = 'profiles'
        break
    case 'productImage':
        folder = 'products'
        break
    case 'documentFile':
        folder = 'documents'
        break
        default:
        return cb(new Error('Este tipo de archivo no esta admitido.'))
}
    
    cb(null, `src/public/img/${folder}`)
}

const storage = multer.diskStorage({
    destination: destination,
    filename: function (req, file, cb) {

        const originalName = file.originalname.replace(/\s/g, '')
        cb(null, Date.now() + '-' + originalName)
        
    },
})


const upload = multer({ storage: storage })

module.exports = upload