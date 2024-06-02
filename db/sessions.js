const { url } = require("./conn.js");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: url,
  collection: "sessions",
});

module.exports = { session, store };
