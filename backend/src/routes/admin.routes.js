const express = require("express");
const adminCtrl = require("../controllers/admin.controller");

const router = express.Router();

// Users Management
router.get("/users", adminCtrl.getUsers);
router.post("/users", adminCtrl.createUser);
router.put("/users/:id", adminCtrl.updateUser);
router.delete("/users/:id", adminCtrl.deleteUser);

// URLs Management
router.get("/urls", adminCtrl.getUrls);
router.post("/urls", adminCtrl.createUrl);
router.patch("/urls/:id", adminCtrl.updateUrl);
router.delete("/urls/:id", adminCtrl.deleteUrl);

module.exports = router;
