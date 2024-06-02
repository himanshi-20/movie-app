const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASS,
  },
});

function getLogin(req, res, next) {
  let message = req.flash();
  if (message["loginMessage"] || message["loginError"]) {
    message = message["loginMessage"] || message["loginError"][0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    message,
    oldInput: null,
  });
}

function postLogin(req, res, next) {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      message,
      oldInput: { email, password },
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          message: "Invalid Credentials!",
          oldInput: { email, password },
        });
      } else {
        return bcrypt.compare(password, user.password).then((doesMatch) => {
          if (!doesMatch) {
            return res.status(422).render("auth/login", {
              pageTitle: "Login",
              path: "/login",
              message: "Invalid Credentials!",
              oldInput: { email, password },
            });
          }
          req.session.user = user;
          req.session.isLoggedIn = true;
          req.session.save((error) => {
            res.redirect("/");
          });
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

function postLogout(req, res, next) {
  req.session.destroy((error) => {
    if (error) console.log(error);
    res.redirect("/");
  });
}

function getSignUp(req, res, next) {
  let message = req.flash("registerError");
  console.log(message);
  if (message.length > 0) message = message[0];
  else message = null;
  res.render("auth/signup", {
    pageTitle: "Create a new account!",
    path: "/signup",
    message,
    oldInput: null,
    validationErrors: null,
  });
}

function postSignUp(req, res, next) {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("registerError", errors.array()[0].msg);
    return res.status(422).render("auth/signup", {
      pageTitle: "Create a new account!",
      path: "/signup",
      message: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: "Devansh",
        email,
        password: hashedPassword,
        cart: { items: [], checkoutTotal: 0 },
      });
      return user.save();
    })
    .then(() => {
      return res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

function getReset(req, res, next) {
  let message = req.flash("resetError");
  if (message.length > 0) message = message[0];
  else message = null;
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    message,
  });
}

function postReset(req, res, next) {
  const { email } = req.body;
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.log(error);
      req.flash(
        "resetError",
        "Error while reseting the password, Please try again later!"
      );
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    let userDoc;
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash("resetError", "Email doesn't exists!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 600000;
        userDoc = user;
        return user.save();
      })
      .then((result) => {
        req.flash("loginMessage", "Reset link sent successfully!");
        res.redirect("/login");
        let mailDetails = {
          from: "jdevansh597@gmail.com",
          to: `${userDoc.email}`,
          subject: "Test mail",
          html: `'Reset Password link test'
                <a href="http:/localhost:8000/reset-password/${token}">Link!</a>
          `,
        };

        transporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log("Error Occurs");
          } else {
            console.log("Reset Password email sent successfully!");
          }
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
      });
  });
}

function getResetPassword(req, res, next) {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) return res.redirect("back");

      let message = req.flash("resetError");
      if (message.length > 0) message = message[0];
      else message = null;
      res.render("auth/reset-password", {
        pageTitle: "Change Your Password",
        path: "/reset-password/:token",
        message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

function postResetPassword(req, res, next) {
  const { userId, password, confirmPassword, passwordToken } = req.body;
  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      return bcrypt.hash(password, 12).then((password) => {
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        return user.save();
      });
    })
    .then((result) => {
      req.flash("loginMessage", "Password Reset Successful!");
      return res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
}

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
  getResetPassword,
  postResetPassword,
};
