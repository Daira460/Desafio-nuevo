const express = require('express');
const router = express.Router();
const faker = require('@faker-js/faker');

const generateProducts = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        thumbnail: faker.helpers.arrayElement(),
        code: faker.string.uuid(),
        stock: faker.number.int({ max: 1000 }),
        status: true,
        category: faker.commerce.productAdjective(),
    };
};
router.get('/mockingproducts', (req, res) => {
    try {
        const products = [];
        for (let i = 0; i < 100; i++) {
            products.push(generateProducts());
        }
        res.json(products);
    } catch (error) {
        console.error('Error al obtener los productos:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
