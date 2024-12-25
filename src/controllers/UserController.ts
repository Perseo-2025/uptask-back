import type {Request, Response} from 'express'
import User from '../model/User'
import { hashPassword } from '../utils/bcrypt'

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
            await user.save()
            res.send('Cuenta creada correctamente')
            
        } catch (error) {
            res.json(500).json({error: error.message})
        }
    } 

}