const Users = require('../DAO/models/user.model')
const { userEmail } = require('../config/server.config')
const transport = require ('../utils/nodemailer.util')

class UserDao {
    async getUsers() {
        try {
            return await Users.find({})
        } catch (error) {
            throw new Error('Error al obtener los usuarios de la base de datos')
        }
    }

    async getUserById(uid) {
        try {
            return await Users.findOne({ _id: uid }).exec()
        } catch (error) {
            throw new Error('Error al obtener el usuario de la base de datos')
        }
    }

    async findByIdDocuments (uid){
        try {
            return await Users.findById(uid).populate('documents')
        } catch (error) {
            throw new Error('Error al obtener el usuario de la base de datos')
        }
    }
    async updateUserCart(uid, cid) {
        try {
            await Users.updateOne({ _id: uid }, { cart: cid }).exec()
        } catch (error) {
            throw new Error('Error al actualizar el carrito del usuario en la base de datos')
        }
    }
 
    async createUser(newUserDto){
        try {
            const createdUser = await Users.create(newUserDto)
            return createdUser
        } catch (error) {
            throw new Error('Error al crear  usuario')
        }
    }
    async findByEmail(email) {
        try {
            const userByEmail = await Users.findOne({ email })
            return userByEmail
        } catch (error) {
            throw new Error('Error buscar el usuario por email')
        }  
    }

    async updatePassword(email, newPassword) {
        try {
            const result = await Users.updateOne({ email }, { password: newPassword })
            return result
        } catch (error) {
            throw new Error('Error cambiar password')
        }  
    }

    
    async toggleUserRole(uid) {
        try {
            const user = await Users.findById(uid)
            if (!user) {
                throw new Error('No se encontró al usuario')
            }

            user.role = user.role === 'user' ? 'premium' : 'user'
            await user.save()

            return user
        } catch (error) {
            console.error(error)
        }
    }

    // Método para actualizar la última conexión del usuario
    async lastConnection(uid) {
        try {
            const user = await Users.findById(uid)
            if (!user) {
                throw new Error('Usuario no encontrado')
            }
            const now = new Date()
            now.setUTCHours(now.getUTCHours() - 3)
            user.last_connection = now
            await user.save()
            return user
        } catch (error) {
            console.error(error)
        }
    }

    // Método para subir una imagen y actualizar el array de documentos del usuario
    async uploadImage(uid, file) {
        try {
            const documentData = {
                name: file.filename,
                reference: file.path
            }
            const user = await Users.findByIdAndUpdate(uid, {
                $push: { documents: documentData }
            }, { new: true })
            return user
        } catch (error) {
            console.error(error)
        }
    }

    // Método para subir múltiples imágenes y actualizar el array de documentos del usuario
    async uploadImages(uid, files) {
        try {
            const documentDataArray = files.map(file => ({
                name: file.filename,
                reference: file.path
            }))
            const user = await Users.findByIdAndUpdate(uid, {
                $push: { documents: { $each: documentDataArray } }
            }, { new: true })
            return user
        } catch (error) {
            console.error(error)
            throw error
        }
    }
    async deleteUsers(users) {
        try {
            const usersDelete = []    
            const now = new Date()
            // Ajustar la fecha y hora a la zona horaria de Argentina
            now.setUTCHours(now.getUTCHours() - 3)
            const nowTimestamp = now.getTime()
s
            const twoDaysAgo = nowTimestamp - (2 * 24 * 60 * 60 * 1000)

            users.forEach(user => {
                if (user.role !== 'admin' && user.status !==false) { // Verifica que no sea el usuario admin
                    const lastConnectionTimestamp = user.last_connection.getTime()
                    if (lastConnectionTimestamp < twoDaysAgo) {
                        usersDelete.push(user)
                    }
                }
            })
            if (usersDelete.length > 0) {
              
                for (const userDelete of usersDelete) {
                    const uid = userDelete._id
                    const foundUser = await Users.findById(uid)
                    if (foundUser) {   
                        // Actualiza el status para eliminar al usuario
                        foundUser.status = false     
                      
                        await foundUser.save()
                        console.log(`Usuario ${foundUser.email} borrado correctamente`)
                        transport.sendMail({
                            from: userEmail,
                            to: foundUser.email,
                            subject: 'Usuario deshabilitado por su inactividad',
                            html: `
                                <h1>Hola ${foundUser.first_name}</h1>
                                <p style="margin-bottom: 20px;">Se ha desactivado tu usuario por su inactividad.</p>
                            `,
                        })
                    }
                }
                return { status: 'success'}
            } else {
                return { status: 'error'}
            }
        } catch (error) {
            console.error('Error al eliminar los usuarios:', error)
            return { status: 'error', message: error.message }
        }
    }
}  


module.exports = UserDao

