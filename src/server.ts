import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { corsConfig } from './config/cors'
import {connectDB} from './config/db'
import projectRouter from './router/project.router'
import authRouter from './router/auth.router'

dotenv.config()

connectDB()

const app = express();
app.use(cors(corsConfig))

//Login
app.use(morgan('dev')) //<- leer los datos del formulario
app.use(express.json()); //<-ojo activar para recibir json

app.use('/api', projectRouter)
app.use('/api/auth', authRouter)

export default app;
