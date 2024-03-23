import express, { Router } from 'express';
const { createCommunity, getAllCommunities, getMembersOfACommunity, myOwnedCommunity, myJoinedCommunity } = require('../controllers/community.controller');
const { isAuthenticated } = require('../middlewares/user.middleware');
const router = express.Router();

router.post('/', isAuthenticated, createCommunity);
router.get('/', isAuthenticated, getAllCommunities);
router.get('/:id/members', isAuthenticated, getMembersOfACommunity);
router.get('/me/owner', isAuthenticated, myOwnedCommunity);
router.get('/me/member', isAuthenticated, myJoinedCommunity);


module.exports = router;