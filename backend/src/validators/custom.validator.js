import { checkPassword } from "../utils/auth.util.js";
import { ExpressValidator } from "express-validator";
import { pool, prisma } from "../config/db.config.js";

const { check } = new ExpressValidator({
  isRegistered: async (value) => {
  
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: value }, { email: value }],
      },
    });
    if (!user) {
      throw new Error("Account does not exist");
    }
    return true;
  },
  isPasswordCorrect: async (value, { req }) => {
    const { identifier } = req.body;
 
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });
    if (user) {
      const isPasswordValid = await checkPassword(user, value);

      if (!isPasswordValid) {
        throw new Error("Incorrect password");
      }
    }
  },

  isEmailTaken: async (value) => {

    const user = await prisma.user.findFirst({
      where: {
        email: value,
      },
    });
    if (user) {
      throw new Error("Email is already taken");
    }
    return true;
  },
  isUsernameTaken: async (value) => {
   
    const user = await prisma.user.findFirst({
      where: {
        username: value,
      },
    });
    if (user) {
      throw new Error("Username is already taken");
    }
    return true;
  },
  isPassowrdMatch: (value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password do not match");
    }
    return true;
  },
  isOldPassword: async (value, { req }) => {
    const { id, code } = req.params;
    // const [rows] = await pool.query(
    //   "SELECT * FROM users WHERE userId = ? AND verificationCode = ? AND codeExpiration > NOW()",
    //   [id, code]
    // );
    // if (rows.length > 0) {
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
      const user = rows[0];
      if (user) {
        const isPasswordValid = await checkPassword(user, value);

        if (isPasswordValid) {
          throw new Error("Password cannot be the same as the old password");
        }
      }
    }
    return true;
  },
});

export { check };
