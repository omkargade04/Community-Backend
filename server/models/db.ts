import { Client } from 'pg'
require('dotenv').config();

export const client = new Client(
    {
        host: "ep-curly-salad-a1knvhto.ap-southeast-1.aws.neon.tech",
        user: "community-backend_owner",
        port: 5432,
        password: "qI8twT6YzZku",
        database: 'community-backend',
        ssl:{
            rejectUnauthorized:true
        }
    }
)
client.connect()
    .then(() => {
        console.log("Connection successful");
    })
    .catch((r: any) => {
        console.log("Unable to connect", r)
    })
