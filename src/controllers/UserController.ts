import type { Request, Response } from "express";
import User from "../model/User";
import { checkPassword, hashPassword } from "../utils/bcrypt";
import Token from "../model/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class UserController {
  static register = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      //Prevenir usuarios duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya existe");
        res.status(400).json({ error: error.message });
        return;
      }

      const user = new User(req.body);
      //Encriptar contraseña
      user.password = await hashPassword(password);

      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //enviar correo
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Cuenta creada correctamente");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  //confirmar cuenta
  static confirmationAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Token no válido");
        res.status(404).json({ error: error.message });
        return;
      }
      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no existe");
        res.status(401).json({ error: error.message });
        return;
      }
      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();
        await token.save();

        //enviar correo
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un email de confirmación"
        );
        res.status(404).json({ error: error.message });
        return;
      }
      //Revisar password
      const isPasswordConfirmedCorrect = await checkPassword(
        password,
        user.password
      );

      if (!isPasswordConfirmedCorrect) {
        const error = new Error("Password Incorrecto");
        res.status(401).json({ error: error.message });
        return;
      }

      const tokencookies = generateJWT({ id: user.id });

      res.send(tokencookies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static requestConfirmationAccount = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      //Usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado");
        res.status(409).json({ error: error.message });
        return;
      }

      if (user.confirmed) {
        const error = new Error("El usuario ya está confirmado");
        res.status(403).json({ error: error.message });
        return;
      }

      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      //enviar correo
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Se envió un nuevo token a tu email");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static changePassword = async (req: Request, res: Response) => {
    //ir para la clase authemail
    try {
      const { email } = req.body;
      //Usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no está registrado papi");
        res.status(404).json({ error: error.message });
        return;
      }
      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      //enviar correo
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send(
        "Revisa tu email y sigue las instrucciones para cambiar tu contraseña"
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static validatedToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });

      if (!tokenExists) {
        const error = new Error("Token no válido");
        res.status(404).json({ error: error.message });
        return;
      }
      res.send("Token válido. Define tu nuevo password");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static changePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        res.status(404).json({ error: error.message });
        return;
      }
      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("El password se modificó correctamente");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
    return;
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const userExits = await User.findOne({ email });
    if (userExits && userExits.id.toString() !== req.user.id.toString()) {
      const error = new Error("El email ya está en uso");
      res.status(409).json({ error: error.message });
      return;
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static updatePasswordProfile = async (req: Request, res: Response) => {
      const { current_password, password } = req.body

      const user = await User.findById(req.user.id)
      
      const isPasswordCorrect = await checkPassword(current_password, user.password)

      if(!isPasswordCorrect){
        const error = new Error('El password actual es incorrecto')
        res.status(401).json({error: error.message})
        return
      }

      user.password = await hashPassword(password)
      try {
        await user.save()
        res.send('Password actualizado correctamente')
      } catch (error) {
          res.status(500).send('Hubo un error')
      }
  }

  static checkPasswordProfile = async (req: Request, res: Response) => {
    const {password} = req.body
    
    const user = await User.findById(req.user.id)

    const isPasswordCorrect = await checkPassword(password, user.password)
    if(!isPasswordCorrect){ 
      const error = new Error('El password es incorrecto')
      res.status(401).json({error: error.message})
      return
    }

    res.send('Password correcto')

  }


}

