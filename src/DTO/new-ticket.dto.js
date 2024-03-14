const { v4: uuidv4 } = require('uuid')

class NewTicketDto {
    constructor(totalAmount, email) {
        this.code = uuidv4()
        this.purchase_datetime = new Date()
        this.amount = totalAmount
        this.purchaser = email
    }
}

module.exports = NewTicketDto