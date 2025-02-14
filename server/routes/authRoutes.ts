import express from 'express';
import { register, login, logout } from '../controllers/authController';
import fileUpload from '../middleware/fileUpload';

const authRouter = express.Router();

authRouter.post('/register', fileUpload.single('profileImage'), register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

export default authRouter;
