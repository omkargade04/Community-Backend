import express, { Router } from 'express';
const userRouter: Router = express.Router();
const { signup, signin, getUser } = require('../controllers/user.controller');
// const {isAuthenticated } = require('../middleware/userMiddleware');

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.get("/me", getUser);

module.exports = userRouter;