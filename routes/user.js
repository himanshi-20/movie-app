const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");

const verifyAuth = require("../middlewares/verifyAuth.js");

const {
  getMyLists,
  getCreateList,
  getAddMovie,
  postAddMovie,
  postCreateList,
  postNewList,
  getRemoveMovie,
  getDeleteList,
  getEditList,
  postEditList,
} = require("../controllers/user.js");

router.get("/mlists", verifyAuth, getMyLists);
router.get("/create", verifyAuth, getCreateList);
router.post(
  "/create",
  verifyAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Please fill in all the required fields.")
      .isString()
      .isLength({ min: 2 })
      .withMessage("Title minimum length is 2")
      .trim(),
    body("description")
      .notEmpty()
      .withMessage("Please fill in all the required fields.")
      .isString()
      .isLength({ min: 10 })
      .withMessage("Description minimum length is 10!")
      .trim(),
  ],
  postCreateList
);
router.get("/addMovie/:mId", verifyAuth, getAddMovie);
router.post("/addMovie/:mId", verifyAuth, postAddMovie);

router.post(
  "/createlist",
  verifyAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Please fill in all the required fields.")
      .isString()
      .isLength({ min: 2 })
      .withMessage("Title minimum length is 2")
      .trim(),
    body("description")
      .notEmpty()
      .withMessage("Please fill in all the required fields.")
      .isString()
      .isLength({ min: 10})
      .withMessage("Description minimum length is 10!")
      .trim(),
  ],
  postNewList
);

router.get("/removeMovie/:mId", verifyAuth, getRemoveMovie);
router.get("/deleteList/:listId", verifyAuth, getDeleteList);
router.get("/edit/:listId", verifyAuth, getEditList);
router.post(
  "/edit/:listId",
  verifyAuth,
  [
    body("title")
      .notEmpty()
      .withMessage("Please fill in all the required fields.")
      .isString()
      .isLength({ min: 2 })
      .withMessage("Title minimum length is 2")
      .trim(),
    body("description")
      .notEmpty()
      .withMessage("Please fill in all the required fields.")
      .isString()
      .isLength({ min: 10 })
      .withMessage("Description minimum length is 10!")
      .trim(),
  ],
  postEditList
);

module.exports = router;
