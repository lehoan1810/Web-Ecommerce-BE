const express = require("express");
const cartController = require("./../controllers/cartController");
const authController = require("./../controllers/authController");

//Create router for cart
const router = express.Router();

///api/v1/users/:userId/cart
// 1) FOR CUSTOMER
router
	.route("/")
	.post(
		authController.protect,
		authController.restrictTo("customer"),
		cartController.addToCart
	)
	.get(
		authController.protect,
		authController.restrictTo("customer"),
		cartController.getCart
	);

router
	.route("/decreaseFromCart")
	.post(
		authController.protect,
		authController.restrictTo("customer"),
		cartController.decreaseCart
	);

router
	.route("/deleteFromCart")
	.post(
		authController.protect,
		authController.restrictTo("customer"),
		cartController.deleteCart
	);

// router
// 	.route('/:cartId')
// 	.patch(
// 		authController.protect,
// 		authController.restrictTo('customer'),
// 		cartController.addToCart
// 	);

// 2) FOR ADMIN
// router
// 	.route('/')
// 	.get(
// 		authController.protect,
// 		authController.restrictTo('admin', 'assistant'),
// 		cartController.getAllCarts
// 	);

// router
// 	.route('/:cardId')
// 	.get(
// 		authController.protect,
// 		authController.restrictTo('admin', 'assistant'),
// 		cartController.getCart
// 	);

//export for using in app
module.exports = router;
