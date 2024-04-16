const mongoose = require ('mongoose')
const mongoosePaginate = require ('mongoose-paginate-v2')
const productsCollection = 'product'

const productsSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: {
        type: String,
        unique: true,
    },
    stock: Number,
    status: Boolean,
    category: String,  
    owner: {
        type:String,
        default: 'admin'
    },
})

productsSchema.plugin(mongoosePaginate)
const Products = mongoose.model(productsCollection, productsSchema)

module.exports = Products