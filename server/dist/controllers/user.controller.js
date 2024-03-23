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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./config.env" });
const user_middleware_1 = require("../middlewares/user.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../models/db");
const snowflake_1 = require("@theinternetfolks/snowflake");
require('dotenv').config();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    console.log(req.body);
    if (!name || !email || !password) {
        console.log("Fill all details", req.body);
        return res.status(401).json({ status: false, message: "Fill all the fields" });
    }
    try {
        console.log("Inserting all fields ", req.body);
        // Get the current timestamp in ISO format
        const timeStamp = new Date().toISOString();
        // Generate a user id using Snowflake
        const user_id = snowflake_1.Snowflake.generate();
        // Insert data into users table
        const insertUser = "INSERT INTO users(id, name, email, password, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING name, email, created_at";
        // Hash the user's password using bcrypt
        const hashPassword = yield bcryptjs_1.default.hash(password, 10);
        // Prepare the values for the SQL query
        console.log(hashPassword);
        const values = [user_id, name, email, hashPassword, timeStamp, timeStamp];
        // Execute the SQL query to insert the user data into the database
        const result = yield db_1.client.query(insertUser, values);
        const data = result.rows;
        console.log(data); // Log the data returned by the query (for debugging purposes)
        // Send a success response to the client
        res.status(200).json({ status: true, message: "User created successfully." });
    }
    catch (err) {
        // Handle errors that occurred during the database operation
        // Extract the duplicate error message from the error object
        const duplicateError = err.message
            .split(" ")
            .pop()
            .replaceAll('"', "");
        if (duplicateError === "user_email_key") {
            // If a user with the same email already exists, send a 409 Conflict response
            res.status(409).json({ error: "User with this email already exists." });
        }
        else {
            // For other errors, log the error and send a 500 Internal Server Error response
            console.log(err);
            res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    }
});
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    if (!email || !password) {
        return res
            .status(400)
            .json({ error: true, message: "All fields are required" });
    }
    if (!password) {
        return res
            .status(400)
            .json({ status: false, content: { message: "Password is required" } });
    }
    try {
        const query = `SELECT * FROM users WHERE email=$1`;
        const param = [email];
        const data = yield db_1.client.query(query, param);
        console.log(data.rows[0]);
        if (data.rowCount === 1) {
            const auth = yield bcryptjs_1.default.compare(password, data.rows[0].password);
            if (auth) {
                const token = yield (0, user_middleware_1.generateUserToken)(data.rows[0].id);
                const user = data.rows[0];
                delete user.password;
                return res.json({
                    status: true,
                    token: token,
                    user: user,
                    message: "User signed in successfully"
                });
            }
            else {
                return res.status(400).json({ status: false, message: "Invalid password" });
            }
        }
        else {
            return res.status(400).json({ status: false, message: "User Not Found" });
        }
    }
    catch (err) {
        return res.status(400).json({ status: false, message: err.message });
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const queryUser = `SELECT * FROM users WHERE id=$1 RETURNING id`;
        const queryUserParams = [userId];
        const userQueryData = yield db_1.client.query(queryUser, queryUserParams);
        res.status(201).json({
            status: true,
            content: {
                data: {
                    id: userQueryData.rows[0].id,
                    name: userQueryData.rows[0].name,
                    email: userQueryData.rows[0].email,
                    created_at: userQueryData.rows[0].created_at.toISOString(),
                },
            },
            message: "User details retrived"
        });
    }
    catch (err) {
        //console.log(req.body);
        if (err.code === "23505") {
            res
                .status(400)
                .json({ status: false, content: { message: "User already exists" } });
        }
        else {
            console.error("Error getting users:", err);
            res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    }
});
module.exports = { signup, signin, getUser };
