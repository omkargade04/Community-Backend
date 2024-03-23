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
require('dotenv').config();
const slugify = require('slugify');
//Create a Community
const createCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const community_id = snowflake_1.Snowflake.generate();
    const { community_name } = req.body;
    const timeStamp = new Date().toISOString();
    const user_id = req.user.id;
    //Validate Community Name
    if (!community_name || community_name.length < 2) {
        return res
            .status(400)
            .json({ error: true, message: "Invalid community name" });
    }
    try {
        const slugified_name = slugify(community_name, { lower: true });
        const communityQuery = `INSERT INTO communities(id, name, slug, owner_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)`;
        const communityParams = [community_id, community_name, slugified_name, user_id, timeStamp, timeStamp];
        const data = yield db_1.client.query(communityQuery, communityParams);
        // const role = "Community Admin";
        const roleQuery = `SELECT id FROM roles WHERE name='Community Admin'`;
        const roleData = yield db_1.client.query(roleQuery);
        const role_id = roleData.rows[0].id;
        const member_id = snowflake_1.Snowflake.generate();
        const memberQuery = `INSERT INTO members(id, community_id, user_id, role_id, created_at) VALUES($1, $2, $3, $4, $5)`;
        const memberParams = [member_id, community_id, user_id, role_id, timeStamp];
        const memberResult = yield db_1.client.query(memberQuery, memberParams);
        res.status(201).json({
            status: true,
            content: {
                data: {
                    id: community_id,
                    name: community_name,
                    slug: slugified_name,
                    owner: user_id,
                    created_at: timeStamp,
                    updated_at: timeStamp,
                },
            },
            message: "Created a community successfully"
        });
    }
    catch (err) {
        console.error("Error creating community:", err);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});
//Getting all communitites
const getAllCommunities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = yield db_1.client.query(`SELECT c.id, c.name, c.slug, c.owner_id, c.created_at, c.updated_at, o.id AS owner_id, o.name AS owner_name FROM communities c JOIN users o ON c.owner_id = o.id ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`, [limit, (page - 1) * limit]);
        const totalRows = yield db_1.client.query(`SELECT COUNT (*) FROM communities`);
        const total = totalRows.rows[0].count;
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            status: true,
            content: { meta: { total, pages, page }, data: result.rows },
            messgae: "Retrived all communities"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});
//Get members of a community
const getMembersOfACommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community_id = req.params.id;
        console.log(community_id);
        const { page = 1, limit = 10 } = req.query;
        const result = yield db_1.client.query(`SELECT m.id, m.community_id, u.id AS user_id, u.name AS name, r.id AS role_id, r.name AS role_name, m.created_at 
        FROM members m 
        JOIN users u ON m.user_id = u.id 
        JOIN roles r ON m.role_id = r.id 
        WHERE m.community_id = $1 
        ORDER BY m.created_at DESC 
        LIMIT $2 OFFSET $3`, [community_id, limit, (page - 1) * limit]);
        const totalRows = yield db_1.client.query("SELECT COUNT (*) FROM members WHERE community_id = $1", [community_id]);
        const total = totalRows.rows[0].count;
        const pages = Math.ceil(total / limit);
        res.status(200).json({
            status: true,
            content: { meta: { total, pages, page }, data: result.rows },
            message: "Retrieved all members of a community"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});
//Community owned by a user
const myOwnedCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    function getOwnedCommunities(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM communities WHERE owner_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
            const queryParams = [userId, limit, (page - 1) * limit];
            const queryCommunities = yield db_1.client.query(query, queryParams);
            return queryCommunities.rows;
        });
    }
    function calPaginationMeta(communities, limit) {
        const totalPages = Math.ceil(communities.length / limit);
        return { total: communities.length, pages: totalPages, page: page };
    }
    try {
        const communities = yield getOwnedCommunities(page, limit);
        const meta = calPaginationMeta(communities, limit);
        res
            .status(200)
            .json({ status: true, content: { meta, data: communities }, message: "Retrived all the communities owned by the user" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
//My joined communitites
const myJoinedCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    function getJoinedCommunitiesWithOwners(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT c.id, c.name, c.slug, c.owner_id, c.created_at, c.updated_at, o.id AS owner_id, o.name AS owner_name 
      FROM communities c 
      JOIN users o ON c.owner_id = o.id 
      JOIN members m ON m.community_id = c.id AND m.user_id = $1 
      ORDER BY c.created_at DESC 
      LIMIT $2 OFFSET $3`;
            const queryParams = [userId, limit, (page - 1) * limit];
            const queryCommunities = yield db_1.client.query(query, queryParams);
            return queryCommunities.rows;
        });
    }
    function calPaginationMeta(communities, limit) {
        const totalPages = Math.ceil(communities.length / limit);
        return { total: communities.length, pages: totalPages, page: page };
    }
    try {
        const communities = yield getJoinedCommunitiesWithOwners(page, limit);
        const meta = calPaginationMeta(communities, limit);
        res
            .status(200)
            .json({ status: true, content: { meta, data: communities }, message: "Retrived user joined communities" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});
module.exports = {
    createCommunity,
    getAllCommunities,
    getMembersOfACommunity,
    myOwnedCommunity,
    myJoinedCommunity,
};
