import mongoose from "mongoose";
import {exit} from 'node:process';

export const connectDB = async() => {
    try {
        const conecction = await mongoose.connect(process.env.DATABASE_URL || '');
        console.log(`Conexion exitosa con la base de datos ${conecction.connection.host}`);
    } catch (error ) {
        console.log(error.mesage);
        exit(1)
    }
}

