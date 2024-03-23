import express, { Request, Response, Application, urlencoded } from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: "./config.env" });
const cors = require('cors');
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

const port = process.env.PORT;

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