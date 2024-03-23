"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { addMember, removeMember } = require('../controllers/member.controller');
const { isAuthenticated } = require('../middlewares/user.middleware');
const router = express_1.default.Router();
router.post('/', isAuthenticated, addMember);
router.delete('/:id', isAuthenticated, removeMember);
module.exports = router;
