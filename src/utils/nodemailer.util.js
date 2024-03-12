const nodemailer = require ('nodemailer')
const { userEmail, userPassword, PortMailer} = require('../config/server.config')

const transport = nodemailer.createTransport ({
    service:'gmail',
    port: PortMailer,
    auth: {
        user:userEmail,
        pass:userPassword,
    }

})

module.exports = transport