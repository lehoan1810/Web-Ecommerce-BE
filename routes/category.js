const express = require("express");
const authController = require("../controllers/authController");

const {
	addCategory,
	getCategories,
	getAllBrand,
	deleteCategory,
} = require("../controllers/category");
const router = express.Router();

router.post("/create", authController.protect, addCategory);
router.get("/getCategory", getCategories);
router.get("/getAllBrand/:id", getAllBrand);
router.delete("deleteCategory/:id", authController.protect, deleteCategory);

module.exports = router;
