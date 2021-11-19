const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/appError");
const Product = require("../models/productModel");

// 1) FOR CUSTOMER
exports.addToCart = catchAsync(async (req, res, next) => {
	const cart = await req.user.addToCart(req.body.productId, req.body.qty);

	res.status(201).json({
		status: "success",
		data: {
			doc: cart,
		},
	});
});

exports.getCart = catchAsync(async (req, res, next) => {
	const cart = await req.user.populate("cart.items.productId");

	res.status(200).json({
		status: "success",
		data: {
			doc: cart,
		},
	});
});

exports.decreaseCart = catchAsync(async (req, res, next) => {
	const decreasedCart = await req.user.decreaseFromCart(
		req.body.productId,
		req.body.qty
	);

	res.status(200).json({
		status: "success",
		data: {
			doc: decreasedCart,
		},
	});
});

exports.deleteCart = catchAsync(async (req, res, next) => {
	const deletedCart = await req.user.removeFromCart(req.body.productId);

	res.status(200).json({
		status: "success",
		data: {
			doc: deletedCart,
		},
	});
});
