"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const trainee_route_1 = require("./app/modules/Trainee/trainee.route");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const globalErrorhandler_1 = __importDefault(require("./app/middlewares/globalErrorhandler"));
const auth_route_1 = require("./app/modules/Auth/auth.route");
const trainer_route_1 = require("./app/modules/Trainer/trainer.route");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, // Allow cookies
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.send('Gym Management System API is running');
});
app.use("/trainee", trainee_route_1.TraineeRoutes);
app.use("/auth", auth_route_1.AuthRoutes);
app.use("/trainer", trainer_route_1.TrainerRoutes);
// Global error handler
app.use(globalErrorhandler_1.default);
exports.default = app;
