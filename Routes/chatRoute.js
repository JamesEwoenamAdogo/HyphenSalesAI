import express from "express";

import {
    sendChatMessage
} from "../Controllers/ChatController.js";

import { authUser } from "../Middleware/authUser.js";


export const chatRouter = express.Router();


chatRouter.post(
    "/",
    authUser,
    sendChatMessage
);


// export default router;