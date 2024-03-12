
const passport = require ('passport')
const local = require ('passport-local')
const GithubStrategy = require ('passport-github2')
const Users = require('../DAO/models/user.model')
const { createHash, useValidPassword } = require('../utils/cryp-password.util')
const { ghClientId, ghClientSecret } = require('../config/server.config')
const Users = require('../DAO/models/user.model')
const UserService = require ('../services/user.service')


const LocalStrategy = local.Strategy

const initializePassport = () => {
    passport.use(
        'register',
         new LocalStrategy(
       {passReqToCallback: true, usernameField: 'email'},
       async (req, username, password, done) => {
        try {
        const {first_name, last_name, age, email} = req.body
        const user = await Users.findOne ({email: username})
        if(user) {
            console.log ('User Exists')
            return done (null, false)
        }
        const NewUserInfo = new NewUserDto (req.body, password)
        const createdUser = await UserService.createUser(NewUserInfo)
        return done (null, createdUser)
        } catch (error) {
            return done (error)
        }
      })
    )

    passport.use('login',  new LocalStrategy({usernameField: 'email'}, async (username, password, done) => {
        try {
            const user = await Users.findOne ({email: username})
        if (!user) {
            console.log ('usuario no existe')
            return done (null, false)
        }
        if (!useValidPassword (user, password)) {
            console.log ('password incorrecta')
            return done (null, error)
        }
        return done (null, user)
        }catch (error) {
            return done (error)
        }
    }))

    passport.use ('github', new GithubStrategy ({
        clientID: ghClientId,
        clientSecret: ghClientSecret,
        callbackURL: "http://localhost:3000/api/auth/githubcallback"
    }, async (accessToken, refreshToken, profile, done) =>  {
        try {
            const {id, login, name, email} = profile._json
            const user = await Users.findOne ({email: email})
            if(!user) {
                const newUserInfo = {
                    first_name: name,
                    email: email,
                    githubId: id,
                    githubUsername: login,
                }
                user = await Users.create(newUserInfo);
            }
            console.log('Usuario actualizado con éxito:', user);
            done(null, user);
        } catch (error) {
            console.error('Error:', error);
            done(error); 
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await Users.findById(id, { password: 0 })
            done(null, user)
        } catch (error) {
            done(error)
        }
    } )

    
}



module.exports = initializePassport