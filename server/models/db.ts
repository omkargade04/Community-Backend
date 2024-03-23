import { Client } from 'pg'
require('dotenv').config();

export const client = new Client(
    {
        host: process.env.HOST,
        user: process.env.USER,
        port: 5432,
        password: process.env.PASSWORD,
        database: process.env.DB,
        // ssl:{
        //     rejectUnauthorized:false
        // }
    }
)
client.connect()
    .then(() => {
        console.log("Connection successful");
    })
    .catch((r: any) => {
        console.log("Unable to connect", r)
    })
