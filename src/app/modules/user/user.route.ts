import { userController } from "./user.controller";
import express from 'express';
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { createUserZodSchema } from "./user.validation";

const router = express.Router();

router.post(
  '/register',
  validateRequest(createUserZodSchema),
  userController.createUser,
);


// router.get('/me',auth("admin","customer"), userController.getMe);
// router.get('/',auth("admin"), userController.getAllUsers);

// router.patch('/update-password',auth("admin","customer"), userController.updatePassword);
// router.patch(
//   "/",
//   auth("admin", "customer"),
//   validateRequest(UserValidation.updateUserValidationSchema),
//   userController.updateUser
// );



export const UserRoutes = router;
