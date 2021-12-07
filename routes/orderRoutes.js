const express = require('express');
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');

//Create router
const router = express.Router();

//ROUTES OF ADMIN
// - get all orders
router
	.route('/')
	.get(
		authController.protect,
		authController.restrictTo('assistant'),
		orderController.getAllOrders
	);

// - get & update one order
router
	.route('/:orderId')
	.get(
		authController.protect,
		authController.restrictTo('assistant'),
		orderController.getOrder
	)
	.patch(
		authController.protect,
		authController.restrictTo('assistant'),
		orderController.updateOrder
	);

//export for using in app
module.exports = router;
