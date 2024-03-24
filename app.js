const express = require('express')
const router = require('./src/router/router')
const { port } = require('./src/config/server.config')
const { Server } = require("socket.io")
const handlebars = require('express-handlebars')
const mongoConnect = require('./src/db')
const chats = []
const Messages = require ('./src/DAO/models/messages.model.js')
const session = require('express-session');
const initializePassport = require('./src/config/passport.config.js')
const passport = require('passport')
const errorMiddleware = require('./src/middlewares/errores-middlewares/errors')

const app = express()

// Configuración de Handlebars
const hbs = handlebars.create({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
})

hbs.handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});

hbs.handlebars.registerHelper('isEqual', function(arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

app.use(express.json())
app.use(express.static(process.cwd() + '/src/public'))
app.use(express.urlencoded ({extended : true}))
app.use(session ({
  secret: 'secretCoder',
  resave: true,
  saveUninitialized: true,
}))


app.use('/bootstrap', express.static(process.cwd() + '/node_modules/bootstrap/dist'))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', hbs.engine)
app.set('views', process.cwd() + '/src/views')
app.set('view engine', 'handlebars')

const httpServer = app.listen(port, () => {
  console.log(`Server running at port ${port}`)
})

const io = new Server(httpServer);

io.on ('connection', (socket) => {  
  socket.on('newUser', data => {
    socket.broadcast.emit ('userConnected', data)
    socket.emit ('messageLogs', chats)
    
  })
  socket.on ('message', async data => {
    chats.push(data) 

    io.emit ('messageLogs', chats) 

    try {
      const NewMessage = {
        user: data.user,
        message: data.message,
      }
      await Messages.create(NewMessage)
    } catch(error){
      console.log (error)
    }
  })
})

app.locals.io = io


mongoConnect()

router(app)

app.use(errorMiddleware)







