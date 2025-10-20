import express from 'express';
import { askToAssistant, getCurrentUser, updateAssistant } from '../controllers/user.controller.js'; 
import isAuth from '../middlewares/isAuth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant); 
userRouter.post("/asktoassistant", isAuth, askToAssistant);

export default userRouter;