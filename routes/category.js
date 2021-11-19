const express = require("express");
const authController = require("../controllers/authController");

const {
	addCategory,
	getCategories,
	getAllBrand,
} = require("../controllers/category");
const router = express.Router();

router.post("/create", authController.protect, addCategory);
router.get("/getCategory", getCategories);
router.get("/getAllBrand/:id", getAllBrand);

module.exports = router;
