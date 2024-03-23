"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserToken = exports.isAuthenticated = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./config.env" });
const db_1 = require("../models/db");
const snowflake_1 = require("@theinternetfolks/snowflake");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `SELECT * FROM user_token WHERE token=$1`;
        const authHeader = req.header('Authorization');
        const token = authHeader ? authHeader.replace('Bearer ', '') : null;
        const value = [token];
        const data = yield db_1.client.query(query, value);
        if (data.rowCount === null) {
            return res.json({ status: false, message: "No user" });
        }
        if (data.rowCount < 1) {
            return res.status(401).json({ status: false, message: "Unauthorized user!" });
        }
        const userId = data.rows[0].fk_user;
        const userQuery = `SELECT * FROM users WHERE id = $1`;
        const userQueryParams = [userId];
        const userQueryData = yield db_1.client.query(userQuery, userQueryParams);
        req.user = userQueryData.rows[0];
        req.token = token;
        next();
    }
    catch (err) {
    }
});
exports.isAuthenticated = isAuthenticated;
const generateUserToken = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(user_id);
        const token_id = snowflake_1.Snowflake.generate();
        const timestamp = new Date();
        const key = process.env.TOKEN_SECRET || 'default_secret_token';
        const token = jsonwebtoken_1.default.sign({ id: user_id }, key, { expiresIn: '24h' });
        const tokenRecord = `INSERT INTO user_token(id, token, fk_user, created_at) VALUES($1, $2, $3, $4)`;
        const values = [token_id, token, user_id, timestamp];
        yield db_1.client.query(tokenRecord, values);
        return token;
    }
    catch (err) {
        console.log(err);
    }
});
exports.generateUserToken = generateUserToken;
