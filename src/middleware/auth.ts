//Middleware que se encarga de verificar si un usuario está autenticado o no
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../model/User'

declare global {
    namespace Express { //<- reescribiendo
        interface Request {
            user?: IUser
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if(!bearer){
        const error = new Error('No autorizado')
        res.status(401).json({error: error.message})
        return
    }

    const token = bearer.split(' ')[1] //<-para omitir el primer valor
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if(typeof decoded === 'object' && decoded.id){
            const user = await User.findById(decoded.id).select('_id name email')
            if(user){ //<-si el usuario existe
                req.user = user      
                next()
            }else{
                res.status(500).json({error: 'Token no válido'})
                return
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no válido'})
        return
    }
    
}

