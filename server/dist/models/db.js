"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const pg_1 = require("pg");
require('dotenv').config();
exports.client = new pg_1.Client({
    host: process.env.HOST,
    user: process.env.USER,
    port: 5432,
    password: process.env.PASSWORD,
    database: process.env.DB,
    // ssl:{
    //     rejectUnauthorized:false
    // }
});
exports.client.connect()
    .then(() => {
    console.log("Connection successful");
})
    .catch((r) => {
    console.log("Unable to connect", r);
});
