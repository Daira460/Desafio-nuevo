const transport = require('../utils/nodemailer.util')
const { userEmail } = require('../configs/app.config')


class MailAdapter {
 async sendMessage(messageInfo){
        await transport.sendMail({
            from: userEmail,
            to: messageInfo.email,
            subject: 'Bienvenido/a',
            html: `
                <h1>Hola ${messageInfo.first_name}</h1>
                <p>Mira las promociones actuales que tenemos</p>
            `,
            attachments: [
                {
                    filename: 'logo.png',
                    path: process.cwd() + '/src/public/img/logo.png',
                    cid: 'logo',
                },
            ],
        })
    }
}


module.exports = MailAdapter