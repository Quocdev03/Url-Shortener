const express = require("express");
const urlCtrl = require("../controllers/url.controller");
const { auth, rateLimit } = require("../middleware");

const router = express.Router();

// URL creation routes
router.post(
	"/",
	rateLimit({ limit: 5, windowSec: 60 }),
	urlCtrl.createUrlPublic,
);

router.post(
	"/auth",
	auth,
	rateLimit({ limit: 30, windowSec: 60 }),
	urlCtrl.createUrlAuth,
);

// URL management routes
router.get("/", auth, urlCtrl.listUrls);
router.get("/:id", auth, urlCtrl.getUrl);
router.patch("/:id", auth, urlCtrl.updateUrl);
router.delete("/:id", auth, urlCtrl.deleteUrl);

module.exports = router;
