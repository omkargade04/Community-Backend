import { Snowflake } from "@theinternetfolks/snowflake";
import { QueryResult } from "pg";
import { client } from "../models/db";

const createRole = async(req: any, res: any) => {
    try{
        const role_id = Snowflake.generate();
        const timeStamp: string = new Date().toISOString();
        const {name} = req.body;
        if(!name){
            return res.status(400).json({status: false, message: "Fill input"});
        }
        const roleQuery = `INSERT INTO roles(id, name, scope, created_at, updated_at) VALUES($1, $2, $3, $4, $5)`;
        const roleParams: any[] = [role_id, name, [name], timeStamp, timeStamp];
        const result: QueryResult<any> = await client.query(roleQuery, roleParams);
        res.status(200).json({status: true, message: `${name} role created successfully`});
    }catch(err: any){
        console.log(err);
        return res.status(500).json({status: false, message: "Internal server error"});
    }
};

const getRoles = async(req: any, res: any) => {
    try{
        const query = `SELECT * FROM roles`;
        const data: QueryResult<any> = await client.query(query);
        console.log(data.rows);
        res.status(200).json({status: true, data: data.rows, message: "Retrived all roles"});
    }catch(err:any){
        console.log(err);
        return res.status(500).json({status: false, message: "Internal server error"});
    }
};

module.exports = {createRole, getRoles};