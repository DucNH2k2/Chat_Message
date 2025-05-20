import { Router } from "express";
import { Authenticate } from "../Middlewares/authenticate";
import { getChatDialogs, getMessages } from "../Controllers/chat.controller";

const chatRouter = Router();
chatRouter.use(Authenticate);

chatRouter.get('/dialogs', getChatDialogs)
chatRouter.get('/messages', getMessages)

export default chatRouter;