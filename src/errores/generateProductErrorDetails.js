const generateProductErrorDetails = product => {

    return `Una o más propiedades estaban incompletas o no válidas.
    Lista de propiedades requeridas:

* Title       : debe ser una cadena, recibido ${product.title},
* Description : debe ser una cadena, recibido ${product.description},
* Code        : debe ser una cadena, recibido ${product.code},
* Price       : debe ser una cadena, recibido ${product.price},
* Stock       : debe ser una cadena, recibido ${product.stock},
* Category    : debe ser una cadena, recibido ${product.category} `;

};

module.exports = generateProductErrorDetails;
