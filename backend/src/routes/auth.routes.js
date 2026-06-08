const express = require("express");
const authCtrl = require("../controllers/auth.controller");
const { auth } = require("../middleware");

const router = express.Router();

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/refresh", authCtrl.refreshToken);
router.post("/logout", auth, authCtrl.logout);
router.get("/profile", auth, authCtrl.profile);
router.patch(
	"/password",
	auth,
	authCtrl.changePassword,
);

module.exports = router;
