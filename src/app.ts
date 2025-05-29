import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRoutes } from './app/modules/User/user.route';
import cookieParser from "cookie-parser";
import globalErrorHandler from './app/middlewares/globalErrorhandler';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send('Gym Management System API is running');
});

app.use("/user", UserRoutes)




// Global error handler
app.use(globalErrorHandler);
export default app;
