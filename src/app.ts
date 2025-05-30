import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TraineeRoutes } from './app/modules/Trainee/trainee.route';
import { TrainerRoutes } from './app/modules/Trainer/trainer.route';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import cookieParser from 'cookie-parser';
import { classRoutes } from './app/modules/Class/class.route';
import { AuthRoutes } from './app/modules/Auth/auth.route';


dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
  credentials: true, // Allow cookies
}));
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send('Gym Management System API is running');
});

app.use("/trainee", TraineeRoutes)
app.use("/auth", AuthRoutes)
app.use("/trainer", TrainerRoutes)
app.use("/class", classRoutes)





// Global error handler
app.use(globalErrorHandler);
export default app;
