const { environment } = require('../config/server.config')

switch (environment) {

  case 'dev':
    console.log('Usando el Nodemailer')
    module.exports = require('./mail.adapter')
    break

  case 'prod':
    console.log('Usando el Twilio')

    break

  default:
 
  break

}