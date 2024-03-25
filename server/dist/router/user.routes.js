"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
const { signup, signin, getUser } = require('../controllers/user.controller');
const { isAuthenticated } = require("../middlewares/user.middleware");

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.get("/me", isAuthenticated, getUser);
module.exports = userRouter;
