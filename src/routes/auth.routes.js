const express = require("express");
const router = express.Router();
const {
  getLoginController,
  postLoginController,
  getRegisterController,
  postRegisterController,
  logOutController
} = require("../controller/auth.controller");

router
  .route("/login")
  .get(getLoginController)
  .post(postLoginController);

router
  .route("/register")
  .get(getRegisterController)
  .post(postRegisterController);

router.get("/logout", logOutController);

module.exports = router;