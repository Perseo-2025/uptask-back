import bcrypt from 'bcrypt'

export const hashPassword = async (password: string) =>{

     //Hash password
     const salt = await bcrypt.genSalt(10)
     return password = await bcrypt.hash(password, salt)

}