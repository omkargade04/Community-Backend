import express, { Router } from 'express';
import { isAuthenticated } from '../middlewares/user.middleware';
const userRouter: Router = express.Router();
const { signup, signin, getUser } = require('../controllers/user.controller');

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.get("/me", isAuthenticated, getUser);

module.exports = userRouter;