import {Router} from 'express'  
import { UserController } from '../controllers/UserController'
import { handleErrors } from '../middleware/validation'
import { body, param } from 'express-validator'

const router = Router()

// register
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

//login
router.post('/login',
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').notEmpty().withMessage('El password es obligatorio'),
    handleErrors,
    UserController.login
)

router.post('/reset-token',
    body('email').isEmail().withMessage('El email es obligatorio'),
    handleErrors,
    UserController.requestConfirmationAccount
)

router.post('/change-password',
    body('email').isEmail().withMessage('El email es obligatorio'),
    handleErrors,
    UserController.changePassword
)

router.post('/validate-token', 
    body('token').not().isEmpty().withMessage('El token es obligatorio'),
    handleErrors,
    UserController.validatedToken
)

router.post('/change-password/:token', 
    param('token').not().isEmpty().withMessage('El token es obligatorio'),
    body('password').isLength({min:8}).not().isEmpty().withMessage('El password es obligatorio'),
    body('password_confirmation').custom((value, {req}) => {
        if (value !== req.body.password) throw new Error('Las contraseñas no coinciden')
        return true
    }),
    handleErrors,
    UserController.changePasswordWithToken
)

export default router