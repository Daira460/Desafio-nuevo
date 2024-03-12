const MailAdapter = require('../Adapter/mail.adapter')
const MessageRepository = require ('./message.repository')
const messageManager = new MessageRepository(new MailAdapter())


module.exports = messageManager