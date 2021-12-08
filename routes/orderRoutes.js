const express = require('express');
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');
const userRoutes = require('../routes/userRoutes');

//Create router
const router = express.Router();

//ROUTES OF CUSTOMERS
// - get all orders
router
	.route('/customer')
	.get(
		authController.protect,
		authController.restrictTo('customer'),
		orderController.getCustomerOrders
	);
// - get one order
router
	.route('/customer/:orderId')
	.get(
		authController.protect,
		authController.restrictTo('customer'),
		orderController.getDetailCustomerOrders
	);

//ROUTES OF ASSISTANTS
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
