const express = require("express");
const userController = require("../controllers/userControllers");

const router = express.Router();
const auth = require("../middleware/auth");

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/auth-test").post(auth, (req, res) => {
  return res.status(234).send("authenticated!");
});

module.exports = router;
