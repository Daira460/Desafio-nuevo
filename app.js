const express = require('express')
const router = require('./src/router/router')
const { Server } = require("socket.io")
const handlebars = require('express-handlebars')
const { port } = require('./src/config/server.config');
const mongoConnect = require('./src/db')
const chats = []
const Messages = require ('./src/DAO/models/messages.model')
const session = require('express-session');

const app = express()

const hbs = handlebars.create({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
})

app.use(express.json())
app.use(express.static(process.cwd() + '/src/public'))
app.use(express.urlencoded ({extended : true}))
app.use(session ({
  secret: 'secretCoder',
  resave: true,
  saveUninitialized: true,
}))

app.use('/bootstrap', express.static(process.cwd() + '/node_modules/bootstrap/dist'))

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




