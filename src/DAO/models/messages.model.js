const mongoose = require ('mongoose')

const messageCollection = 'message'

const messageSchema = new mongoose.Schema({
    
    user: String,
    message: String,
})

const Messages = mongoose.model(messageSchema,  messageCollection)

module.exports = Messages