import express, { Request, Response, Application, urlencoded } from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config({ path: "./config.env" });
import { generateUserToken } from "../middlewares/user.middleware";
import bcrypt from "bcryptjs";
import { client } from "../models/db";
import { ReqMid } from "../types/user";
import { QueryResult } from "pg";
import { Snowflake } from "@theinternetfolks/snowflake";
require('dotenv').config();


const signup = async(req: Request, res: Response) => {
    const {name, email, password} = req.body;
    console.log(req.body);
    if(!name || !email || !password){
        console.log("Fill all details", req.body);
        return res.status(401).json({ status: false, message: "Fill all the fields" });
    }
    try{
        console.log("Inserting all fields ", req.body);
        // Get the current timestamp in ISO format
        const timeStamp: string = new Date().toISOString();
        // Generate a user id using Snowflake
        const user_id = Snowflake.generate()
        // Insert data into users table
        const insertUser: string = "INSERT INTO users(id, name, email, password, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6) RETURNING name, email, created_at";
        // Hash the user's password using bcrypt
        const hashPassword = await bcrypt.hash(password, 10);
        // Prepare the values for the SQL query
        console.log(hashPassword);
        const values: any[] = [user_id, name, email, hashPassword, timeStamp, timeStamp];
      // Execute the SQL query to insert the user data into the database
        const result: QueryResult<any> = await client.query(insertUser, values);
        const data = result.rows;

        console.log(data); // Log the data returned by the query (for debugging purposes)

        // Send a success response to the client
        res.status(200).json({ status: true, message: "User created successfully." });
    }catch(err: any){
      // Handle errors that occurred during the database operation

      // Extract the duplicate error message from the error object
      const duplicateError: string = err.message
        .split(" ")
        .pop()
        .replaceAll('"', "");

      if (duplicateError === "user_email_key") {
        // If a user with the same email already exists, send a 409 Conflict response
        res.status(409).json({ error: "User with this email already exists." });
      } else {
        // For other errors, log the error and send a 500 Internal Server Error response
        console.log(err);
        res.status(500).json({ status: false, message: "Internal Server Error" });
      }
    }
}

const signin = async(req: ReqMid, res: Response) => {
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
    try{
        const query = `SELECT * FROM users WHERE email=$1`;
        const param = [email];
        const data: QueryResult<any> = await client.query(query, param);
        console.log(data.rows[0]);

        if(data.rowCount === 1){
            const auth = await bcrypt.compare(password, data.rows[0].password);
            if(auth){
                const token = await generateUserToken(data.rows[0].id);
                const user = data.rows[0];
                delete user.password;
                return res.json({
                    status: true,
                    token: token,
                    user: user,
                    message: "User signed in successfully"
                });
            } else {
                return res.status(400).json({status: false, message: "Invalid password"});
            }
        } else {
            return res.status(400).json({status: false, message: "User Not Found"});
        }
    }catch(err: any){
        return res.status(400).json({status: false, message: err.message});
    }
};

const getUser = async (req:any, res:any) => {
  try {
    const userId = req.user.id;
    const queryUser = `SELECT * FROM users WHERE id=$1 RETURNING id`;
    const queryUserParams = [userId];
    const userQueryData = await client.query(queryUser, queryUserParams);
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
  } catch (err:any) {
    //console.log(req.body);
    if (err.code === "23505") {
      res
        .status(400)
        .json({ status: false, content: { message: "User already exists" } });
    } else {
      console.error("Error getting users:", err);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  }
};

module.exports = {signup, signin, getUser};