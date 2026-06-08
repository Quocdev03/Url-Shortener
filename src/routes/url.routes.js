const express = require("express");
const urlCtrl = require("../controllers/url.controller");
const { auth, rateLimit } = require("../middleware");

const router = express.Router();

router.post("/", rateLimit({ limit: 5, windowSec: 60 }), urlCtrl.createUrl);
router.post(
	"/auth",
	auth,
	rateLimit({ limit: 30, windowSec: 60 }),
	urlCtrl.createUrl,
);
router.get("/", auth, urlCtrl.listUrls);
router.get("/:id/stats", auth, urlCtrl.getStats);
router.get("/:id", auth, urlCtrl.getUrl);
router.patch("/:id", auth, urlCtrl.updateUrl);
router.delete("/:id", auth, urlCtrl.deleteUrl);

module.exports = router;
