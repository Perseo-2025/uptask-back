import moongose, {Schema, Document} from "mongoose"

export interface IUser extends Document {
    email: string
    password: string
    name: string
    last_name: string
    confirmed:boolean
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        requeired: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    confirmed: {
        type: Boolean,
        default: false
    }
})

const User = moongose.model<IUser>('User', userSchema)
export default User