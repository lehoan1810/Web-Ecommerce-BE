const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllOrders = catchAsync(async (req, res, next) => {
	const users = await User.find();

	let orders = [];
	users.forEach((user) => {
		if (user.purchasingHistory.length !== 0) {
			user.purchasingHistory.forEach((order) => {
				orders.push({
					user: user.id,
					order,
				});
			});
		}
	});

	res.status(200).json({
		status: 'success',
		length: orders.length,
		data: {
			orders,
		},
	});
});

exports.getOrder = catchAsync(async (req, res, next) => {
	const users = await User.find();
	let order;
	users.forEach((user) => {
		user.purchasingHistory.forEach((history) => {
			if (history.id === req.params.orderId) order = history;
		});
	});
	if (order == null) {
		return next(new AppError('No order found with this id!', 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			order,
		},
	});
});

exports.updateOrder = catchAsync(async (req, res, next) => {
	const users = await User.find();

	let order;
	users.forEach(async (user) => {
		user.purchasingHistory.forEach(async (history) => {
			if (history.id === req.params.orderId) {
				if (history.status >= req.body.status) {
					return next(
						new AppError(
							'Trạng thái truyền vào phải lớn hơn trạng thái hiện có',
							401
						)
					);
				}
				if (req.body.status > 2) {
					return next(
						new AppError(
							`Trạng thái được truyền vào không hợp lệ (status: ${req.body.status} is NOT accepted)`,
							401
						)
					);
				}
				if (req.body.status > history.status + 1) {
					return next(
						new AppError(
							`Trạng thái được truyền vào không hợp lệ (lớn hơn trạng thái hiện tại 2 bậc)`,
							401
						)
					);
				}
				history.status = req.body.status;
				order = history;

				await user.save();

				res.status(200).json({
					status: 'success',
					data: {
						order,
					},
				});
			}
		});
	});
});
