import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import { ITask } from "./Task";


//Un proyecto tiene muchas tareas
export interface IProject extends Document  {
    projectName : string,
    clientName : string,
    description : string,

    tasks: PopulatedDoc<ITask & Document>[] 
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
    ]
}, {timestamps: true})

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;