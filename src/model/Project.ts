import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import { ITask } from "./Task";
import { IUser } from "./User";


//Un proyecto tiene muchas tareas
export interface IProject extends Document  {
    projectName : string,
    clientName : string,
    description : string,
    tasks: PopulatedDoc<ITask & Document>[] 
    manager: PopulatedDoc<IUser & Document> //administrador del proyecto, solo hay un manager por proyecto
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
    }
}, {timestamps: true})

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;