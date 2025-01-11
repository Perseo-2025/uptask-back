import { Request, Response } from "express";
import Project from "../model/Project";

export class ProjectController {

  
  //Obtener todos los proyectos
  static getAllProject = async (req: Request, resp: Response) => {
    try {
      //ojo: seccion 44, vídeo 570
      //traer los projectos del usuario autenticado
      const project = await Project.find({
          $or:[
            {manager: {$in: req.user.id}},//SE OBTIENE SI TU ERES EL MANAGER DEL PROYECTO
            {team: {$in: req.user.id}} //si eres miembro o parte del equipo
          ]
      })
      resp.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  //creando proyecto
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
 
    //Asigna un manager
    project.manager = req.user.id //asigna el id del manager

    
    if (!project) {
      const error = new Error('Proyecto no encontrado');
      res.status(404).json({ error: error.message });
      return;
    }
 
    try {
      await project.save();
      res.send('Proyecto creado correctamente');
    } catch (error) {
      console.log(error);
    }
 
  };

  static getProjectById = async(req: Request, res: Response) => {
    const { id } = req.params
    try {
      const project = await Project.findById(id).populate('tasks');
      //console.log('ID proyecto: ',req.user.id.toString());
      //console.log('ID usuario: ',project.manager.toString());
      
      if(!project){ 
        const error = new Error('Proyecto no encontrado')
        res.status(404).json({error: error.message})
        return
      }

      //revisar si el proyecto pertenece al manager 
      if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id) ){
        const error = new Error('No se relacionan')
        res.status(404).json({error: error.message})
        return
      }

      res.json(project);
    } catch (error) {
      console.log(error);
    }
  }

  static updateProject = async(req: Request, res: Response) => {

    try {
      req.project.clientName = req.body.clientName
      req.project.projectName = req.body.projectName
      req.project.description = req.body.description
      await req.project.save();
      res.send("Proyecto actualizado correctamente");
    } catch (error) {
      console.log(error);
    }
  }

  static deleteProject = async(req: Request, res: Response) => {
    
    try {
      await req.project.deleteOne()
      res.send("Proyecto eliminado correctamente");
    } catch (error) {
      console.log(error);
    }
  }
  
}
