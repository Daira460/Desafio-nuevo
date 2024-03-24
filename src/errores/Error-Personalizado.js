class ErrorPersonalizado {

    static crearError ({nombre = 'error', causa, mensaje, codigo = 1}){
        const error = new Error(mensaje)
        error.causa = causa
        error.nombre = nombre
        error.codigo = codigo
        throw error
    }
    
}

module.exports = ErrorPersonalizado
