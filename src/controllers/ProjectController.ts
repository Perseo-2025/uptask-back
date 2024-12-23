import { Request, Response } from "express";
import Project from "../model/Project";

export class ProjectController {

  
  //Obtener todos los proyectos
  static getAllProject = async (req: Request, resp: Response) => {
    try {
      const project = await Project.find({})
      resp.json(project);
    } catch (error) {
      console.log(error);
    }
  };

  //creando proyecto
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
 
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
    try {
      const project = await Project.findById(req.params.id).populate('tasks');
      console.log(project);
      (project);
      if(!project){
        res.status(404).send("No existe el proyecto");
      }
      res.json(project);
    } catch (error) {
      console.log(error);
    }
  }

  static updateProject = async(req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.params.id);
      if(!project){
        res.status(404).send("No existe el proyecto");
      } 
      project.clientName = req.body.clientName
      project.projectName = req.body.projectName
      project.description = req.body.description

      await project.save();
      res.json({"message": "Proyecto actualizado", project});
    } catch (error) {
      console.log(error);
    }
  }

  static deleteProject = async(req: Request, res: Response) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      if(!project){
        res.status(404).send("No existe el proyecto");
      } 
      res.json({"message": "Proyecto Eliminado correctamente", project});
    } catch (error) {
      console.log(error);
    }
  }
  
}
