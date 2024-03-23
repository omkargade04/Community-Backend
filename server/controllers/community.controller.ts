import { Snowflake } from "@theinternetfolks/snowflake";
import { Query, QueryResult } from "pg";
import { client } from "../models/db";
import { ReqMid } from "../types/user";
require('dotenv').config();

const slugify = require('slugify');


//Create a Community
const createCommunity = async(req: any, res: any) => {
    const community_id = Snowflake.generate();
    const {community_name} = req.body;
    const timeStamp: string = new Date().toISOString();

    const user_id = req.user.id;
    
    //Validate Community Name
    if (!community_name || community_name.length < 2) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid community name" });
    }

    try{
        const slugified_name = slugify(community_name, {lower: true});

        const communityQuery = `INSERT INTO communities(id, name, slug, owner_id, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6)`;
        const communityParams: any[] = [community_id, community_name, slugified_name, user_id, timeStamp, timeStamp];
        const data: QueryResult<any> = await client.query(communityQuery, communityParams);

        // const role = "Community Admin";
        const roleQuery = `SELECT id FROM roles WHERE name='Community Admin'`;
        const roleData: QueryResult<any> = await client.query(roleQuery);
        const role_id = roleData.rows[0].id;

        const member_id = Snowflake.generate();
        const memberQuery = `INSERT INTO members(id, community_id, user_id, role_id, created_at) VALUES($1, $2, $3, $4, $5)`;
        const memberParams: any[] = [member_id, community_id, user_id, role_id, timeStamp];
        const memberResult: QueryResult<any> = await client.query(memberQuery, memberParams);

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
    }catch(err: any){
        console.error("Error creating community:", err);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

//Getting all communitites
const getAllCommunities = async (req: any, res: any) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result: QueryResult<any> = await client.query(
        `SELECT c.id, c.name, c.slug, c.owner_id, c.created_at, c.updated_at, o.id AS owner_id, o.name AS owner_name FROM communities c JOIN users o ON c.owner_id = o.id ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, (page - 1) * limit]
      );
      const totalRows: QueryResult<any> = await client.query(`SELECT COUNT (*) FROM communities`);
      const total = totalRows.rows[0].count;
      const pages = Math.ceil(total / limit);
      res.status(200).json({
        status: true,
        content: { meta: { total, pages, page }, data: result.rows },
        messgae: "Retrived all communities"
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  };

//Get members of a community
const getMembersOfACommunity = async (req: any, res: any) => {
    try {
      const community_id = req.params.id;
      console.log(community_id);
      const { page = 1, limit = 10 } = req.query;
      const result: QueryResult<any> = await client.query(
        `SELECT m.id, m.community_id, u.id AS user_id, u.name AS name, r.id AS role_id, r.name AS role_name, m.created_at 
        FROM members m 
        JOIN users u ON m.user_id = u.id 
        JOIN roles r ON m.role_id = r.id 
        WHERE m.community_id = $1 
        ORDER BY m.created_at DESC 
        LIMIT $2 OFFSET $3`,
        [community_id, limit, (page - 1) * limit]
      );
      const totalRows: QueryResult<any> = await client.query(
        "SELECT COUNT (*) FROM members WHERE community_id = $1",
        [community_id]
      );
      const total = totalRows.rows[0].count;
      const pages = Math.ceil(total / limit);
      res.status(200).json({
        status: true,
        content: { meta: { total, pages, page }, data: result.rows },
        message: "Retrieved all members of a community"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

//Community owned by a user
const myOwnedCommunity = async (req: ReqMid, res: any) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    async function getOwnedCommunities(page: any, limit: any) {
      const query: string = `SELECT * FROM communities WHERE owner_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      const queryParams = [userId, limit, (page - 1) * limit];
      const queryCommunities = await client.query(query, queryParams);
      return queryCommunities.rows;
    }
    function calPaginationMeta(communities: any[], limit: any) {
      const totalPages = Math.ceil(communities.length / limit);
      return { total: communities.length, pages: totalPages, page: page };
    }
    try {
      const communities = await getOwnedCommunities(page, limit);
      const meta = calPaginationMeta(communities, limit);
  
      res
        .status(200)
        .json({ status: true, content: { meta, data: communities }, message: "Retrived all the communities owned by the user" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

//My joined communitites
const myJoinedCommunity = async (req: ReqMid, res: any) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    async function getJoinedCommunitiesWithOwners(page: any, limit: any) {
      const query: string = `SELECT c.id, c.name, c.slug, c.owner_id, c.created_at, c.updated_at, o.id AS owner_id, o.name AS owner_name 
      FROM communities c 
      JOIN users o ON c.owner_id = o.id 
      JOIN members m ON m.community_id = c.id AND m.user_id = $1 
      ORDER BY c.created_at DESC 
      LIMIT $2 OFFSET $3`;
      const queryParams = [userId, limit, (page - 1) * limit];
      const queryCommunities = await client.query(query, queryParams);
  
      return queryCommunities.rows;
    }
  
    function calPaginationMeta(communities: any[], limit: any) {
      const totalPages = Math.ceil(communities.length / limit);
      return { total: communities.length, pages: totalPages, page: page };
    }
  
    try {
      const communities = await getJoinedCommunitiesWithOwners(page, limit);
      const meta = calPaginationMeta(communities, limit);
      res
        .status(200)
        .json({ status: true, content: { meta, data: communities }, message: "Retrived user joined communities" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

module.exports = {
    createCommunity,
    getAllCommunities,
    getMembersOfACommunity,
    myOwnedCommunity,
    myJoinedCommunity,
  };