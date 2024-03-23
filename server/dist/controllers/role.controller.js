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
Object.defineProperty(exports, "__esModule", { value: true });
const snowflake_1 = require("@theinternetfolks/snowflake");
const db_1 = require("../models/db");
const createRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const role_id = snowflake_1.Snowflake.generate();
        const timeStamp = new Date().toISOString();
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ status: false, message: "Fill input" });
        }
        const roleQuery = `INSERT INTO roles(id, name, scope, created_at, updated_at) VALUES($1, $2, $3, $4, $5)`;
        const roleParams = [role_id, name, [name], timeStamp, timeStamp];
        const result = yield db_1.client.query(roleQuery, roleParams);
        res.status(200).json({ status: true, message: `${name} role created successfully` });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = `SELECT * FROM roles`;
        const data = yield db_1.client.query(query);
        console.log(data.rows);
        res.status(200).json({ status: true, data: data.rows, message: "Retrived all roles" });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});
module.exports = { createRole, getRoles };
