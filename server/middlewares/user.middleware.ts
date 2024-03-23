import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { client } from "../models/db";
import { QueryResult } from "pg";
import { Snowflake } from "@theinternetfolks/snowflake";

export const isAuthenticated = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  try {
    const query = `SELECT * FROM user_token WHERE token=$1`;
    const authHeader = req.header("Authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;
    const value: any[] = [token];
    const data: QueryResult<any> = await client.query(query, value);

    if (data.rowCount === null) {
      return res.json({ status: false, message: "No user" });
    }
    if (data.rowCount < 1) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized user!" });
    }
    const userId = data.rows[0].fk_user;
    const userQuery = `SELECT * FROM users WHERE id = $1`;
    const userQueryParams = [userId];
    const userQueryData = await client.query(userQuery, userQueryParams);

    req.user = userQueryData.rows[0];
    req.token = token;
    next();
  } catch (err: any) {}
};
export const generateUserToken = async (user_id: number) => {
  try {
    console.log(user_id);
    const token_id = Snowflake.generate();
    const timestamp = new Date();
    const key = process.env.TOKEN_SECRET || "default_secret_token";
    const token = jwt.sign({ id: user_id }, key, { expiresIn: "24h" });
    const tokenRecord: string = `INSERT INTO user_token(id, token, fk_user, created_at) VALUES($1, $2, $3, $4)`;
    const values: any[] = [token_id, token, user_id, timestamp];
    await client.query(tokenRecord, values);
    return token;
  } catch (err: any) {
    console.log(err);
  }
};
