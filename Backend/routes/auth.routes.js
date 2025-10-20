import express from 'express';
import { Login, Logout, Signup } from '../controllers/auth.controllers.js';


const authRouter = express.Router();

authRouter.post("/signup",Signup);
authRouter.post("/login",Login);
authRouter.get("/logout",Logout);



export default authRouter;