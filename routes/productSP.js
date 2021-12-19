const express = require("express");
const reviewRoutes = require("./../routes/reviewRoutes");
const authController = require("../controllers/authController");
const {
	createProduct,
	getProductsById,
	getProductDetail,
	updateProductById,
	deleteProductById,
	getAllProducts,
	get5ProductsNew,
} = require("../controllers/product");
const router = express.Router();
// const { addCategory, getCategories } = require("../controllers/category");

router.post(
	"/addproduct",
	authController.protect,
	authController.restrictTo("assistant"),
	createProduct
);
router.get("/getProductsId/:id", getProductsById);
router.get("/getProductDetail/:id", getProductDetail);
router.patch(
	"/updateProductById/:id",
	authController.protect,
	updateProductById
);
router.get("/getAllProduct", getAllProducts);
router.get("/get5ProductsNew", get5ProductsNew);
router.delete("/deleteProductById", authController.protect, deleteProductById);

// review product
router.use("/:productId/reviews", reviewRoutes);

module.exports = router;
