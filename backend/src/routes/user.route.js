import express from "express";

import { me } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const userRoute = express.Router();

userRoute.get("/me", authMiddleware, me);

export { userRoute };
