const express = require("express");
const authController = require("../controllers/authController");
const { createBrand } = require("../controllers/brand");
const router = express.Router();

router.post(
	"/addbrand",
	authController.protect,
	authController.restrictTo("assistant"),
	createBrand
);

module.exports = router;
