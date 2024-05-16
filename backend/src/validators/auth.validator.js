import { check } from "./custom.validator.js";

const validateLogin = [
  check("identifier")
    .notEmpty()
    .withMessage("Username or Email is required is required")
    .bail()
    .isRegistered(),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isPasswordCorrect(),
];

const validateRegister = [
  check("userId").notEmpty().withMessage("UserId is required"),
  check("firstName").notEmpty().withMessage("First name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("username").notEmpty().withMessage("Username is required"),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email address")
    .bail()
    .isEmailTaken(),
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .bail()
    .isUsernameTaken(),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&,*._])(?=.*\d).{8,16}$/, "i")
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .bail()
    .isPassowrdMatch(),
];

const validateNewPassword = [
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8, max: 16 })
    .withMessage("Password must be between 8 and 16 characters")
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&,*._])(?=.*\d).{8,16}$/, "i")
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .bail()
    .isOldPassword(),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .bail()
    .isPassowrdMatch(),
];

const validateForgotPassword = [
  check("identifier")
    .notEmpty()
    .withMessage("Username or Email is required")
    .bail()
    .isRegistered(),
];

export {
  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateNewPassword,
};
