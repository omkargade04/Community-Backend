import express, { Router } from 'express';
const { addMember, removeMember } = require('../controllers/member.controller');
const { isAuthenticated } = require('../middlewares/user.middleware');
const router = express.Router();

router.post('/', isAuthenticated, addMember);
router.delete('/:id', isAuthenticated, removeMember);

module.exports = router;