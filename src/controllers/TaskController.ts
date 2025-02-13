import type { Request, Response } from "express";

import Task from "../model/Task";


export class TaskController {

    static createTask = async(req: Request, res: Response) => {
        try {
            const task = new Task(req.body);
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()]) //<-arreglo de promesas
            res.send('Tarea creada correctamente')
        } catch (error) {
                console.log(error);
            
        }
    }

    //traer todas las tareas que pertenece a ese proyecto
    static getProjectTask = async(req:Request, res: Response) => {
        try {
            const task = await Task.find({project: req.project.id}).populate('project') //<-trae las tareas que pertenecen a ese proyecto
            res.json(task);
        } catch (error) {
            res.json(500).json({error: error.message})
            
        }
    }

    //traer las tareas por su id
    static getTaskById = async(req:Request, res:Response) => {
        try {
            //validato por el middleware por eso estáreducido
            const task = await Task.findById(req.params.taskId)
                                .populate({path: 'completedBy.user', select: 'id name email'}) //trayendo información del usuario
                                .populate({path: 'notes', populate: {path: 'createdBy', select: 'id name email'}}) //trayendo las notas
            res.json(task);
        } catch (error) {
            res.json(500).json({error: error.message})
        }
    }
    
    static updateTask = async(req:Request, res:Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.send('Tarea actualizada correctamente')
        } catch (error) {
            res.json(500).json({error: error.message})
        }
    }

    static deleteTask = async(req:Request, res:Response) => {
        try {
            //await task.deleteOne()
            //await req.project.save()
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])

            res.send('Tarea eliminada correctamente')
        } catch (error) {
            res.json(500).json({error: error.message})
        }
    }

    static changeStatusTask = async(req:Request, res:Response) => {
        try {
            const {status} = req.body
            req.task.status = status
            const data = {user: req.user.id, status}
            req.task.completedBy.push(data)
            await req.task.save()
            res.send('Estado de la tarea actualizado')
        } catch (error) {
            res.json(500).json({error: error.message})
        }
    }

}