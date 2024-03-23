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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./config.env" });
const cors = require('cors');
const userRoutes = require('../router/user.routes');
const roleRoutes = require('../router/role.routes');
const communityRoutes = require('../router/community.routes');
const memberRoutes = require('../router/member.routes');
// const adminRoutes = require('../router/adminRoutes');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cors());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/v1/auth', userRoutes);
app.use('/v1/role', roleRoutes);
app.use('/v1/community', communityRoutes);
app.use('/v1/member', memberRoutes);
const port = process.env.PORT;
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("first");
        res.send("Hello");
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}));
app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
});
