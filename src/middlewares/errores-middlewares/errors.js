const CodigosErrores = require('../../errores/codigos_errores');

const errorMiddleware = (error, req, res, next) => {
    if (error) {
        req.logger.error('El error es:', error);
        if (error.code) {
            switch (error.codigo) {
                case CodigosErrores.NO_ENCONTRADO:
                    res.status(CodigosErrores.NO_ENCONTRADO).json({ status: 'error', error: error.causa });
                    break;

                case CodigosErrores.ERROR_CREACION_PRODUCTO:
                    res.status(CodigosErrores.ERROR_CREACION_PRODUCTO).json({ status: 'error', error: error.causa });
                    break;

                case CodigosErrores.ERROR_SERVIDOR_INTERNO:
                    res.status(CodigosErrores.ERROR_SERVIDOR_INTERNO).json({ status: 'error', error: error.causa });
                    break;

                case CodigosErrores.INFORMACION_USUARIO_INVALIDA:
                    res.status(CodigosErrores.INFORMACION_USUARIO_INVALIDA).json({ status: 'error', error: error.causa });
                    break;

                case CodigosErrores.NO_AUTORIZADO:
                    res.status(CodigosErrores.NO_AUTORIZADO).json({ status: 'error', error: error.causa });
                    break;

                default:
                    res.status(CodigosErrores.ERROR_SERVIDOR_INTERNO).json({ status: 'error', error: 'Error interno del servidor' });
                    break;
            }
        } else { 
            res.status(CodigosErrores.ERROR_SERVIDOR_INTERNO).json({ status: 'error', error: 'Error interno del servidor' });
        } 
     } else  {
            res.status(CodigosErrores.ERROR_SERVIDOR_INTERNO).json({ status: 'error', error: 'Error interno del servidor' });
        }
    };

module.exports = errorMiddleware;



