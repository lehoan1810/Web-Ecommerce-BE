const express = require("express");
const reviewRoutes = require("./../routes/reviewRoutes");
const authController = require("../controllers/authController");
const {
	createProduct,
	getProductsById,
	getProductDetail,
	updateProductById,
	deleteProductById,
} = require("../controllers/product");
const router = express.Router();
// const { addCategory, getCategories } = require("../controllers/category");

router.post(
	"/addproduct",
	authController.protect,
	authController.restrictTo("assistant"),
	createProduct
);
router.get("/getProductsId/:id", authController.protect, getProductsById);
router.get("/getProductDetail/:id", authController.protect, getProductDetail);
router.patch(
	"/updateProductById/:id",
	authController.protect,
	updateProductById
);
router.delete("/deleteProductById", authController.protect, deleteProductById);

// review product
router.use("/:productId/reviews", reviewRoutes);

module.exports = router;