const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user.js");

const router = express.Router();

const {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
  getResetPassword,
  postResetPassword,
} = require("../controllers/auth.js");

// /login => GET
router.get("/login", getLogin);

// /login => POST
router.post(
  "/login",
  [
    body("email", "Please enter the required fields.").notEmpty(),
    body("password", "Please enter the required fields.").notEmpty(),
    check("email", "Please enter a valid email!").isEmail().normalizeEmail(),
  ],
  postLogin
);

// /logout => POST
router.post("/logout", postLogout);

// /signup => GET
router.get("/signup", getSignUp);

// /signup => POST
router.post(
  "/signup",
  [
    body("email", "Please fill out all required fields.").notEmpty(),
    body("password", "Please fill out all required fields.").notEmpty(),
    body("confirmPassword", "Please fill out all required fields.").notEmpty(),
    check("email", "Please enter a valid email!").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password is too short!")
      .isStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Please enter a password with atleast one number, symbol and atleast one uppercase and lowercase character! "
      ).trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords doesn't match!");
      }
      return true;
    }).trim(),
    body("email").normalizeEmail().custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(
            "Email already exists, Please use a different email address!"
          );
        }
      });
    }),
  ],
  postSignUp
);

// /reset => GET
router.get("/reset", getReset);

// /reset => POST
router.post("/reset", postReset);

// /reset/:token => GET
router.get("/reset-password/:token", getResetPassword);
router.post("/reset-password", postResetPassword);

module.exports = router;
