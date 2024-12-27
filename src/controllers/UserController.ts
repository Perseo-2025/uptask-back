import type {Request, Response} from 'express'
import User from '../model/User'
import { hashPassword } from '../utils/bcrypt'
import Token from '../model/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'

export class UserController {
    
    static register = async(req: Request, res:Response) => {
        try {
            const { password, email } = req.body
            
            //Prevenir usuarios duplicados
            const userExists = await User.findOne({email})
            if(userExists) {
                const error = new Error('El usuario ya existe')
                res.status(400).json({error: error.message})
                return
            }

            const user = new User(req.body)
           //Encriptar contraseña
            user.password = await hashPassword(password)

            //Generar el token
            const  token = new Token()
            token.token = generateToken()
            token.user = user.id

            //enviar correo
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.email,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Cuenta creada correctamente')
            
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    } 

    //confirmar cuenta
    static confirmationAccount = async(req:Request, res:Response) => {
        try {
            const {token} = req.body
            const tokenExists = await Token.findOne({token})

            if(!tokenExists) {
                const error = new Error('Token no válido')
                res.status(401).json({error: error.message})
                return
            } 
            const user = await User.findById(tokenExists.user)
            user.confirmed = true
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            if(!user) {
                const error = new Error('El usuario no existe')
                res.status(401).json({error: error.message})
                return
            }
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    }
}