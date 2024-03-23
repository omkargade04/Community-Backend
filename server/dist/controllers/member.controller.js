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
//Add member
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member_id = snowflake_1.Snowflake.generate();
        const timeStamp = new Date().toISOString();
        const { community_id, user_id, role_id } = req.body;
        if (!community_id || !user_id || !role_id) {
            return res
                .status(400)
                .json({ status: false, message: "All fields are required" });
        }
        const memberQuery = `INSERT INTO members(id, community_id, user_id, role_id, created_at) VALUES($1, $2, $3, $4, $5)`;
        const memberParams = [
            member_id,
            community_id,
            user_id,
            role_id,
            timeStamp,
        ];
        const memberResult = yield db_1.client.query(memberQuery, memberParams);
        res.status(200).json({
            status: true,
            content: {
                data: {
                    id: member_id,
                    community: community_id,
                    user: user_id,
                    role: role_id,
                    created_at: timeStamp,
                },
            },
            message: "Member successfully added to the communnity"
        });
    }
    catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ status: false, message: "Internal server error" });
    }
});
//Removing members
const removeMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member_id = req.params.id;
        console.log(member_id);
        const user_id = req.user.id;
        console.log(user_id);
        const adminRole_id = 7177065090381910904;
        //Verifying if the user is admin or not
        const verifyAdminQuery = `SELECT * FROM members WHERE user_id = ${user_id} AND role_id = 7177065090381910904`;
        const verifyAdminResult = yield db_1.client.query(verifyAdminQuery);
        const community_id = verifyAdminResult.rows[0].community_id;
        console.log(community_id);
        const deleteMemberQuery = `DELETE FROM members WHERE community_id = ${community_id} AND id = ${member_id}`;
        const deleteMemberResult = yield db_1.client.query(deleteMemberQuery);
        res.status(200).json({ status: true, message: "Member removed" });
    }
    catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ status: false, content: { message: "Internal Server Error" } });
    }
});
module.exports = { addMember, removeMember };
