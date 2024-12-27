import {Router} from 'express'  
import { UserController } from '../controllers/UserController'
import { handleErrors } from '../middleware/validation'
import { body } from 'express-validator'

const router = Router()

router.post('/register', 
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').isLength({min:8}).not().isEmpty().withMessage('El password es obligatorio'),
    body('password_confirmation').custom((value, {req}) => {
        if (value !== req.body.password) throw new Error('Las contraseñas no coinciden')
        return true
    }),
    body('name').not().isEmpty().withMessage('El nombre es obligatorio'),
    body('last_name').not().isEmpty().withMessage('El apellido es obligatorio'),
    handleErrors,
    UserController.register
)

router.post('/confirmation-account',
    body('token').not().isEmpty().withMessage('El token es obligatorio'),
    handleErrors,
    UserController.confirmationAccount
)




export default router