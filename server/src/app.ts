import express, { Request, Response, Application, urlencoded } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ path: "./config.env" });
const cors = require('cors');
const cron = require('node-cron')
const userRoutes = require('../router/user.routes');
const roleRoutes = require('../router/role.routes');
const communityRoutes = require('../router/community.routes');
const memberRoutes = require('../router/member.routes');
// const adminRoutes = require('../router/adminRoutes');

const app: Application = express();
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({extended: true}));

app.use('/v1/auth', userRoutes);
app.use('/v1/role', roleRoutes);
app.use('/v1/community', communityRoutes)
app.use('/v1/member', memberRoutes)

const port = process.env.PORT || 8000;

app.get('/', async (req: Request, res: Response) => {
    try {
        console.log("first")
        res.send("Hello");
    }
    catch (err: any) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, (): void => {
    console.log(`server is running at http://localhost:${port}`);
}) 

// Added cron

app.get("/ping", (req, res) => {
    res.status(200).json("pong....");
  });
  
  const API_ENDPOINT = "https://community-backend-5z55.onrender.com";
  
  const makeApiRequest = async () => {
    try {
      const response = await axios.get(API_ENDPOINT);
      return response.data;
    } catch (err: any) {
      console.error("API request failed:", err.message);
      throw err;
    }
  };
  
  const runApiRequestJob = async () => {
    console.log("Running API request job...");
    try {
      const responseData = await makeApiRequest();
      return responseData;
    } catch (error) {
      return null;
    }
  };
  
  // Schedule the API request job to run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    const responseData = await runApiRequestJob();
    if (responseData) {
      // Process the response data here
      console.log("API request successful:", responseData);
    } else {
      console.log("API request failed");
    }
  });