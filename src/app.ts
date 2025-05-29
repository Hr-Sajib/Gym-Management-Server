import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRoutes } from './app/modules/user/user.route';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Gym Management System API is running');
});

app.use("/user", UserRoutes)

export default app;
