const express = require("express");
const productController = require("../controllers/productController");

//Create router for product
const router = express.Router();

router
	.route("/")
	.get(productController.getAllProducts)
	.post(productController.createProduct);
router

	.route("/:id")
	.get(productController.getProductById)
	.patch(productController.updateProduct)
	.delete(productController.deleteProduct);
router.route("/:name").get(productController.getProductByName);

//export for using in app
module.exports = router;
