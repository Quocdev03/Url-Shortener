const express = require("express");
const urlCtrl = require("../controllers/url.controller");
const { auth, authorize } = require("../middleware");

const router = express.Router();

/**
 * Get analytics data (Admin only)
 * GET /api/v1/analytics/
 */
router.get("/", auth, authorize("admin"), urlCtrl.getAnalytics);

module.exports = router;
