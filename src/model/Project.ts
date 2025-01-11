import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";


//Un proyecto tiene muchas tareas
export interface IProject extends Document  {
    projectName : string,
    clientName : string,
    description : string,

    tasks: PopulatedDoc<ITask & Document>[] 

    manager: PopulatedDoc<IUser & Document> //administrador del proyecto, solo hay un manager por proyecto

    //armando el team
    team: PopulatedDoc<IUser & Document>[]

}

const ProjectSchema:Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim    : true,
        unique  : true
    },
    clientName: {
        type: String,
        required: true,
        trim    : true,
        unique  : true
    },
    description: {
        type: String,
        required: true,
        trim    : true,
        unique  : true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
}, {timestamps: true})


// Middleware
// Elimina las 
ProjectSchema.pre('deleteOne', {document: true}, async function() {
    const projectId = this._id
    if(!projectId) return 

    const tasks = await Task.find({project: projectId})
    for(const task of tasks){
        await Note.deleteMany({task: task._id})
    }

    await Task.deleteMany({project: projectId})
    console.log(this._id)
})

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;