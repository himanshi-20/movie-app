// Modules
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const flash = require("connect-flash");
const crypto = require("crypto");

const dotenv = require("dotenv");
// Declares
const app = express();
const { connectToDb } = require("./db/conn.js");
const { session, store } = require("./db/sessions.js");
const { csrfProtection } = require("./security/csrf.js");

dotenv.config({ path: "./.env" });
// Template Engine
app.set("view engine", "ejs");
app.set("views", "views");

// Routes
const userRoutes = require("./routes/user");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const { pageNotFound, serverSideError } = require("./controllers/errors");

// Models
const User = require("./models/user.js");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SECRET_STRING,
    saveUninitialized: false,
    resave: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (user) {
        req.user = user;
      }
      next();
    })
    .catch((error) => console.log(error));
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrf = req.csrfToken();
  next();
});

app.use(shopRoutes);
app.use(userRoutes);
app.use(authRoutes);
app.get("/500", serverSideError);
app.use(pageNotFound);

// ERROR HANDLERS
app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/500");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => {
  connectToDb();
  console.log(`The server is up at port ${PORT}!`);
});
