const express = require("express");
const router = express.Router();
const {
  getIndex,
  postSearch,
  getMovie,
  getList
} = require("../controllers/shop.js");
const verifyAuth = require("../middlewares/verifyAuth.js");

router.get("/", getIndex);
router.post("/search", postSearch);
router.get("/movies/:mId", verifyAuth, getMovie);

router.get('/lists/:listId', getList); 

module.exports = router;
