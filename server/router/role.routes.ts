require("dotenv").config();
const cilent = require("../models/db");
import express, { Router } from 'express';
const {createRole, getRoles} = require('../controllers/role.controller');
const router = express.Router();

router.post("/", createRole);
router.get("/", getRoles);

module.exports = router;
