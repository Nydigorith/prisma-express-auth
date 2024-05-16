import moment from "moment";
import asyncHandler from "express-async-handler";

import { pool, prisma } from "../config/db.config.js";

import {
  generateToken,
  generateCode,
  hashPassword,
  sendEmailVerification,
} from "../utils/auth.util.js";

// @route   GET /auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { identifier } = req.body;
  // const [rows] = await pool.query(
  //   "SELECT * FROM users WHERE username = ? OR email = ?",
  //   [identifier, identifier]
  // );
  console.log(identifier);
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (user) {
    if (user.accountStatus !== "verified") {
      // if (rows[0].accountStatus !== "verified") {
      const code = await generateCode();
      const expiresAt = moment()
        .add(15, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");

      // const [result] = await pool.query(
      //   "UPDATE users SET verificationCode = ?, codeExpiration = ? WHERE username = ? OR email = ?",
      //   [code, expiresAt, identifier, identifier]
      // );
      const unverifiedUser = await prisma.user.update({
        where: {
          userId: user.userId,
        },
        data: {
          code,
          expiresAt,
        },
      });

      // if (result.affectedRows > 0) {
      if (unverifiedUser) {
        const isSent = await sendEmailVerification(
          unverifiedUser.email,
          `activate/${unverifiedUser.userId}/${code}`
        );
        if (isSent) {
          console.log(unverifiedUser.email);
          res.status(200).json({
            success: true,
            message:
              "To be able to use your account, please activate it first by clicking the link sent to your email.",
          });
        }
      }
    } else {
      res
        .cookie("token", await generateToken(user.userId, "1d"), {
          withCredentials: true,
          httpOnly: false,
        })
        .status(200)
        .json({
          success: true,
          message: "Login successful.",
        });
    }
  }
  throw new Error("Internal Server Error");
});

// @route   GET /auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { userId, firstName, lastName, username, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  const code = await generateCode();
  const expiresAt = moment().add(15, "minutes").format("YYYY-MM-DD HH:mm:ss");

  // const [result] = await pool.query(
  //   "INSERT INTO users (userId, firstName, lastName, username, email, password,verificationCode,codeExpiration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  //   [
  //     userId,
  //     firstName,
  //     lastName,
  //     username,
  //     email,
  //     hashedPassword,
  //     code,
  //     expiresAt,
  //   ]
  // );

  const user = await prisma.user.create({
    data: {
      userId,
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      code,
      expiresAt,
    },
  });

  if (user) {
    // if (result.affectedRows > 0) {
    const isSent = await sendEmailVerification(
      email,
      `activate/${userId}/${code}`
    );

    if (isSent) {
      res.status(200).json({
        success: true,
        message:
          "To be able to use your account, please activate it first by clicking the link sent to your email.",
      });
    }
  }
  throw new Error("Internal Server Error");
});

// @route   GET /auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;
  const code = await generateCode();
  const expiresAt = moment().add(15, "minutes").format("YYYY-MM-DD HH:mm:ss");

  // const [rows] = await pool.query(
  //   "SELECT * FROM users WHERE username = ? OR email = ?",
  //   [identifier, identifier]
  // );

  const user = await prisma.user.update({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
    data: {
      code,
      expiresAt,
    },
  });

  // const [result] = await pool.query(
  //   "UPDATE users SET verificationCode = ?, codeExpiration = ? WHERE  userId = ?",
  //   [code, expiresAt, rows[0].userId]
  // );

  // if (result.affectedRows > 0) {
  if (user) {
    const isSent = await sendEmailVerification(
      rows[0].email,
      `new-password/${rows[0].userId}/${code}`
    );

    if (isSent) {
      res.status(200).json({
        success: true,
        message: "To be able to change your password, please check your email.",
      });
    }
  }
  throw new Error("Internal Server Error");
});

// @route   PUT /auth/new-password/:id/:code
// @access  Private
const newPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const hashedPassword = await hashPassword(password);

  const { id, code } = req.params;
  // const [result] = await pool.query(
  //   "UPDATE users SET password = ?, verificationCode = ?  WHERE userId = ? AND verificationCode = ? AND codeExpiration > NOW()",
  //   [hashedPassword, 0, id, code]
  // );
  const user = await prisma.user.update({
    where: {
      userId: id,
      code,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      password: hashedPassword,
      code: 0,
      expiresAt: new Date(),
    },
  });
  if (user) {
    // if (result.affectedRows > 0) {
    return res.status(200).json({
      success: true,
      message: "Password successfully changed",
    });
  }
  throw new Error("Internal Server Error");
});

// @route   PUT /auth/activate/:id/:code
// @access  Private
const activateCode = asyncHandler(async (req, res, next) => {
  const { id, code } = req.params;

  // const [result] = await pool.query(
  //   "UPDATE users SET verificationCode = ?,  accountStatus = ? WHERE userId = ? AND verificationCode = ? AND codeExpiration > NOW()",
  //   [0, "verified", id, code]
  // );

  const user = await prisma.user.update({
    where: {
      userId: id,
      code,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      code: 0,
      expiresAt: new Date(),
      accountStatus: "verified",
    },
  });

  if (user) {
    // if (result.affectedRows > 0) {
    return res.status(200).json({
      success: true,
      message:
        "Your account has been activated. You can now login to your account.",
    });
  }
  res.status(403);
  throw new Error("Not authorized.");
});

// @route   GET /auth/verify/:id/:code
// @access  Private
const verifyCode = asyncHandler(async (req, res, next) => {
  const { id, code } = req.params;

  // const [result] = await pool.query(
  //   "SELECT * FROM users WHERE userId = ? AND verificationCode = ? AND codeExpiration > NOW()",
  //   [id, code]
  // );
  const user = await prisma.user.findFirst({
    where: {
      userId: id,
      code,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  if (user) {
    // if (result.affectedRows > 0) {
    return res.status(200).json({
      success: true,
      message: "Authorized",
    });
  }
  res.status(403);
  throw new Error("Not authorized.");
});

export {
  login,
  register,
  forgotPassword,
  newPassword,
  activateCode,
  verifyCode,
};
