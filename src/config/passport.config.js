const passport = require('passport');
const local = require('passport-local');
const GithubStrategy = require('passport-github2');
const { useValidPassword } = require('../utils/cryp-password.util');
const { ghClientId, ghClientSecret } = require('../config/server.config');
const UserService = require('../services/user.service');
const NewUserDto = require('../DTO/new-user.dto');
const Users = require('../DAO/models/user.model');


const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use(
        'register',
         new LocalStrategy(
       {passReqToCallback: true, usernameField: 'email'},
       async (req, username, password, done) => {
        try {
        const user = await Users.findOne ({email: username})
        if(user) {
            console.log ('el correo ya se encuentra registrado')
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
            const user = await Users.findOne({ email: username })
        if (!user) {
            console.error ('Usuario o contraseña incorrecta')
            return done (null, false)
        }
        if (user.status === false) {
            console.error ('usuario desactivado por inactividad')
            return done (null, false)
        }
        
        const uid = user._id
        await UserService.lastConnection(uid)
        return done (null, user)
        }catch (error) {
            return done (error)
        }
    }))

    passport.use('github', new GithubStrategy({
        clientID: ghClientId,
        clientSecret: ghClientSecret,
                callbackURL: 'http://localhost:3000/api/auth/githubcallback'
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { id, login, name, email } = profile._json;
                    let user = await Users.findOne({ email: email });
                    if (!user) {
                        const newUserInfo = {
                            first_name: name,
                            email: email,
                            githubId: id,
                            githubUsername: login,
                        };
                        user = await Users.create(newUserInfo);
                    }
                    console.log('Usuario actualizado con éxito:', user);
                    done(null, user);
                } catch (error) {
                    console.error('Error:', error);
                    done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await Users.findById(id)
            done(null, user)
        } catch (error) {
            done(error)
        }
    } )
    
}

module.exports = initializePassport;
