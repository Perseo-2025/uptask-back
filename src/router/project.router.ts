import {Router} from 'express'
import {body, param} from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { validateProjectExists } from '../middleware/project'
import { hasAuthorization, taskBelongToProject, tasktExists } from '../middleware/task'
import { authenticateToken } from '../middleware/auth'
import { TeamMemberController } from '../controllers/TeamMenmberController'
import { NoteController } from '../controllers/NoteController'

//ojo-> una tarea tiene un proyecto y un proyecto tiene muchas tareas!!!
const router = Router()
//como cada ruta necesita estar autenticada, usaremos el middleware globalmentede autenticación

/*Cuando agregas router.use('/api', authenticateToken), todos los endpoints que comiencen con /api estarán protegidos por el middleware authenticateToken. Sin embargo, en el código que compartiste, ninguno de tus endpoints parece comenzar con /api. Por lo tanto, este middleware global no afecta tus rutas actuales.*/
router.use('/dashboard',authenticateToken) //<-protege todos los endpoint que usen router

router.post('/dashboard/projects',
    body('projectName').not().isEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').not().isEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').not().isEmpty().withMessage('La descripcion es obligatoria'),
    handleErrors,
    ProjectController.createProject
)

router.get('/dashboard/projects', 
    ProjectController.getAllProject
)

router.get('/dashboard/projects/:id',
    param('id').isMongoId().withMessage('El id es obligatorio'),
    handleErrors,
    ProjectController.getProjectById
)

router.param('projectId', validateProjectExists)

router.put('/dashboard/projects/:projectId',
    param('projectId').isMongoId().withMessage('El id es obligatorio'),
    body('projectName').not().isEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').not().isEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').not().isEmpty().withMessage('La descripcion es obligatoria'),
    handleErrors,
    hasAuthorization,
    ProjectController.updateProject
)

router.delete('/dashboard/projects/:projectId',
    param('projectId').isMongoId().withMessage('El id es obligatorio'),
    handleErrors,
    hasAuthorization,
    ProjectController.deleteProject
)

/* Routes for task */
router.param('taskId', tasktExists)
router.param('taskId', taskBelongToProject)

router.post('/dashboard/:projectId/tasks',
    hasAuthorization,
    body('name').not().isEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').not().isEmpty().withMessage('La descripcion es obligatoria'),
    handleErrors,
    TaskController.createTask
)

router.get('/dashboard/:projectId/tasks', 
    TaskController.getProjectTask
)

router.get('/dashboard/:projectId/tasks/:taskId', 
    param('taskId').isMongoId().withMessage('El id de la tarea es obligatorio'),
    handleErrors,
    TaskController.getTaskById,
)

router.put('/dashboard/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('taskId').isMongoId().withMessage('El id de la tarea es obligatorio'),
    body('name').not().isEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').not().isEmpty().withMessage('La descripcion es obligatoria'),
    handleErrors,
    TaskController.updateTask
)

router.delete('/dashboard/:projectId/tasks/:taskId', 
    hasAuthorization,
    param('taskId').isMongoId().withMessage('El id de la tarea es obligatorio'),
    handleErrors,
    TaskController.deleteTask
)

//endpoint para cambiar el estado de una tarea
router.post('/dashboard/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('El id de la tarea es obligatorio'),
    body('status').notEmpty().withMessage('El status es obligatorio'),
    handleErrors,
    TaskController.changeStatusTask
)

/* Routes for teams */
//preguntamos al usuario cual es su email para agregarle al proyecto
router.post('/dashboard/:projectId/team/search',
    body('email').isEmail().withMessage('El email es obligatorio'),
    handleErrors,
    TeamMemberController.findMemberByEmail
)

router.post('/dashboard/:projectId/team',
    body('id').isMongoId().withMessage('ID no válido'),
    handleErrors,
    TeamMemberController.addTeamMember
)

router.get('/dashboard/:projectId/team',
    TeamMemberController.getAllTeamMember
)

router.delete('/dashboard/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('ID no válido'),
    handleErrors,
    TeamMemberController.removeMemberById
)

/*----- Rutas para las notas -----*/
router.post('/dashboard/projects/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleErrors,
    NoteController.createNote
)

router.get('/dashboard/projects/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/dashboard/projects/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('El id de la nota es obligatorio'),
    handleErrors,
    NoteController.deleteNote
)


export default router;