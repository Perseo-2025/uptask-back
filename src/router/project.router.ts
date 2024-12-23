import {Router} from 'express'
import {body, param} from 'express-validator'
import { ProjectController } from '../controllers/ProjectController'
import { handleErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { validateProjectExists } from '../middleware/project'
import { taskBelongToProject, tasktExists } from '../middleware/task'

//ojo-> una tarea tiene un proyecto y un proyecto tiene muchas tareas!!!
const router = Router()

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
    param('id').not().isEmpty().withMessage('El id es obligatorio'),
    handleErrors,
    ProjectController.getProjectById
);

router.put('/dashboard/projects/:id',
    param('id').not().isEmpty().withMessage('El id es obligatorio'),
handleErrors,
    ProjectController.updateProject
);

router.delete('/dashboard/projects/:id',
    param('id').not().isEmpty().withMessage('El id es obligatorio'),
    handleErrors,
    ProjectController.deleteProject
);

/* Routes for task */
router.param('projectId', validateProjectExists)
router.param('taskId', tasktExists)
router.param('taskId', taskBelongToProject)

router.post('/dashboard/:projectId/tasks',
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
    param('taskId').isMongoId().withMessage('El id de la tarea es obligatorio'),
    body('name').not().isEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').not().isEmpty().withMessage('La descripcion es obligatoria'),
    handleErrors,
    TaskController.updateTask
)

router.delete('/dashboard/:projectId/tasks/:taskId', 
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

export default router;