const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const dbUser = process.env.dbUSER;
const dbPassword = process.env.dbPASSWORD;
const dbName = process.env.dbNAME;

const url = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.vsybayl.mongodb.net/${dbName}`;

async function connectToDb(callbackFunction = null) {
  try {
    const db = await mongoose.connect(url);
    if (db) console.log(`Successfully connected to the ${dbName} database!`);
    if (callbackFunction) callbackFunction();
  } catch (error) {
    const dbError = new Error("Connection to database failed!");
    dbError.httpStatusCode = 503;
    next(dbError);
  }
}

module.exports = { connectToDb, url };
