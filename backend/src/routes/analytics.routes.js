const express = require("express");
const urlCtrl = require("../controllers/url.controller");
const { auth, authorize } = require("../middleware");

const router = express.Router();

// Get all analytics
router.get("/", auth, urlCtrl.getAnalytics);

// Get stats for a specific URL
router.get("/:id/stats", auth, urlCtrl.getStats);

module.exports = router;
