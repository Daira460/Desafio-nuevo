const { environment } = require ('../../config/server.config.js')
trimmedEnvironment = environment.trim()

switch (trimmedEnvironment) {
    case 'dev':
      module.exports = require('./devLogger')
      break
  
    case 'prod':
      module.exports = require('./prodLogger')
      break
  }