const CodigosErrores = require('../../errores/codigos_errores')

const errorMiddleware = (error, req, res, next) => {
    console.log('Error del middleware es:', error.cause)
    switch (error.codigo) { 
        case CodigosErrores.NOT_FOUND:
            res.status(CodigosErrores.NOT_FOUND).json({ status: 'error', error: error.message })
            break

        case CodigosErrores.PRODUCT_CREATION_ERROR:
            res.status(CodigosErrores.PRODUCT_CREATION_ERROR).json({ status: 'error', error: error.message })
            break

        case CodigosErrores.SERVER_GATEWAY_ERROR:
            res.status(CodigosErrores.SERVER_GATEWAY_ERROR).json({ status: 'error', error: error.message })
            break

        case CodigosErrores.INVALID_USER_INFO:
            res.status(CodigosErrores.INVALID_USER_INFO).json({ status: 'error', error: error.message })
            break

        case CodigosErrores.PRODUCT_NOT_FOUND:
            res.status(CodigosErrores.PRODUCT_NOT_FOUND).json({ status: 'error', error: error.message })
            break

        case CodigosErrores.NOT_AUTHORIZED:
            res.status(CodigosErrores.NOT_AUTHORIZED).json({ status: 'error', error: error.message })
            break

        default:
            res.status(CodigosErrores.INTERNAL_SERVER_ERROR).json({ status: 'error', error: 'Internal server error' })
            break
    }
}

module.exports = errorMiddleware


