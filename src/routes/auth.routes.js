const express = require("express");
const router = express.Router();
const {
  getLoginController,
  postLoginController,
  getRegisterController,
  postRegisterController,
} = require("../controller/auth.controller");

router
  .route("/login")
  .get(getLoginController)
  .post(postLoginController);

router
  .route("/register")
  .get(getRegisterController)
  .post(postRegisterController);

module.exports = router;