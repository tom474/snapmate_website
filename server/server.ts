import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import connectDB from './models/dbConnection';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import groupRouter from './routes/groupRoutes';
import requestRouter from './routes/requestRoutes';
import postRouter from './routes/postRoutes';

dotenv.config();
const app = express();
const port = 8080;

declare module 'express-session' {
  interface SessionData {
    userId: mongoose.Types.ObjectId;
    username: String;
    isAdmin: boolean;
  }
  interface session {
    userId: mongoose.Types.ObjectId;
    username: String;
    isAdmin: boolean;
  }
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Server is running!');
});

app.use('/', authRouter);
app.use('/users', userRouter);
app.use('/groups', groupRouter);
app.use('/requests', requestRouter);
app.use('/posts', postRouter);

await connectDB();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
