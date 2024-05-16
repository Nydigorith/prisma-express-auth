import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import multer from "multer";

import { userRoute } from "./routes/user.route.js";
import { authRoute } from "./routes/auth.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
dotenv.config();
const PORT = process.env.PORT;

const app = express();
const upload = multer();

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(upload.none());

app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

// app.post("/api/prisma", async (req, res) => {
//   const user = await prisma.user.create({
//     data: {
//       id: randowmId(),
//       email: "darwinemail",
//       name: "darwin",
//       password: "darwinpassword",
//     },
//   });
//   console.log(user);
//   res.json(user);
// });

const randowmId = () => {
  return Math.floor(Math.random() * 1000);
};

app.use(errorMiddleware);
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});
