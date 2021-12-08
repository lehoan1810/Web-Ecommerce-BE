const lodash = require('lodash');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const sortByDate = (orders, query, role) => {
	orders = lodash.orderBy(
		orders,
		[
			(order) =>
				new Date(role === 'customer' ? order.date : order.order.date),
		], //
		query === '-date' ? ['asc'] : ['desc']
	);

	return orders;
};

const filterByStatus = (orders, query, role) => {
	if (!lodash.inRange(query * 1, 0, 3))
		throw new AppError(
			`Trạng thái được truyền vào không hợp lệ (status: ${query} is NOT accepted)`,
			401
		);
	let filteredOrders = [];
	orders.forEach((order) => {
		new String(
			role === 'customer' ? order.status : order.order.status
		).trim() === new String(query).trim() && filteredOrders.push(order);
	});
	orders = filteredOrders;

	return orders;
};

exports.getCustomerOrders = catchAsync(async (req, res, next) => {
	// 1) get orders of this customer
	let orders = req.user.purchasingHistory;

	// 2) query: sort by date
	orders = sortByDate(orders, req.query.sort, req.user.role);

	// 3) query: filer by query in URL (status)
	if (req.query.status)
		orders = filterByStatus(orders, req.query.status, req.user.role);

	// 2) send response
	res.status(200).json({
		status: 'success',
		length: orders.length,
		data: {
			orders,
		},
	});
});

exports.getDetailCustomerOrders = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	// 1) get that order (by req.params.orderId)
	let order;
	user.purchasingHistory.forEach((el) => {
		el.id === req.params.orderId && (order = el);
	});
	if (order == null) {
		return next(new AppError('No order found with this id!', 404));
	}

	// 2) send response
	res.status(200).json({
		status: 'success',
		data: {
			order,
		},
	});
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
	const users = await User.find();

	// 1) get all orders
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

	// 2) query: sort by date
	orders = sortByDate(orders, req.query.sort, req.user.role);

	// 3) query: filer by query in URL (status)
	if (req.query.status)
		orders = filterByStatus(orders, req.query.status, req.user.role);

	// 4) send response
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
