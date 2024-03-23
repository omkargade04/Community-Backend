"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const { createCommunity, getAllCommunities, getMembersOfACommunity, myOwnedCommunity, myJoinedCommunity } = require('../controllers/community.controller');
const { isAuthenticated } = require('../middlewares/user.middleware');
const router = express_1.default.Router();
router.post('/', isAuthenticated, createCommunity);
router.get('/', isAuthenticated, getAllCommunities);
router.get('/:id/members', isAuthenticated, getMembersOfACommunity);
router.get('/me/owner', isAuthenticated, myOwnedCommunity);
router.get('/me/member', isAuthenticated, myJoinedCommunity);
module.exports = router;
