import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { userController } from "../../modules/User/user.controller";
import {
  createUserZodSchema,
  loginUserZodSchema,
  refreshTokenZodSchema,
  updateUserZodSchema,
} from "../User/user.validation";

const router = express.Router();

// Create/register a new user
router.post(
  "/register",
  auth("ADMIN","TRAINEE"),
  validateRequest(createUserZodSchema),
  userController.createUser
);

// login
router.post(
  "/login",
  validateRequest(loginUserZodSchema),
  userController.loginUser
);

// refresh
router.post(
  "/refresh-token",
    auth("ADMIN", "TRAINER" , "TRAINEE"),
  validateRequest(refreshTokenZodSchema),
  userController.refreshToken
);

// Get all users
router.get("/", auth("ADMIN"), userController.getAllUsers);

// Get a single user by ID
router.get("/:id", auth("ADMIN"), userController.getUserById);

// Update a user by ID
router.patch(
  "/:id",
  auth("ADMIN"),
  validateRequest(updateUserZodSchema),
  userController.updateUser
);

// Delete a user by ID
router.delete("/:id", auth("ADMIN"), userController.deleteUser);

export const UserRoutes = router;
