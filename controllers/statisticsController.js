const lodash = require('lodash');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const getSoldProducts = async (Model) => {
	const users = await Model.find();
	let soldProducts = [];
	users.forEach((user) => {
		user.purchasingHistory.forEach((order) => {
			order.items.forEach((item) => {
				//const found = soldProducts.some(el => el.productId === item.productId)
				const existIndex = soldProducts.findIndex(
					(el) =>
						new String(el.productId).trim() ===
						new String(item.productId).trim()
				);
				if (existIndex >= 0) {
					soldProducts[existIndex].qty += 1;
				} else {
					soldProducts.push({
						productId: item.productId,
						productName: item.productName,
						qty: item.qty,
						date: order.date,
						dateConverted: order.date.toDateString(), //Thu Sep 12 2021
					});
				}
			});
		});
	});

	return soldProducts;
};

const getBy = (getBy, soldProducts, paramsValue) => {
	//get all indices of soldProducts by month params
	let indices = soldProducts
		.map((e, i) => {
			if (getBy === 'month') {
				return !e.dateConverted.includes(monthName(paramsValue * 1))
					? i
					: '';
			} else {
				const splitedDate = e.dateConverted.split(
					e.dateConverted.substring(0, 11)
				);
				splitedDate[0] = 'somewhat';
				return splitedDate[1] * 1 !== paramsValue * 1 ? i : '';
			}
		})
		.filter(String);
	if (indices.length !== 0)
		for (let i = indices.length - 1; i >= 0; i--) {
			soldProducts.splice(indices[i], 1);
		}

	//sort descly by qty
	soldProducts = lodash.orderBy(soldProducts, [(el) => el.qty], ['desc']);

	return soldProducts;
};

// prettier-ignore
const monthsInYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// prettier-ignore
const monthName = (mon) => {
	return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][mon - 1];
}
// prettier-ignore
const monthExtractedToNumber = (elInfo) => {
	const monthExtracted = elInfo.dateConverted.slice(4, 7);
	const result = monthsInYear.indexOf(monthExtracted) + 1;
	return result;
}

exports.getTop5BestSellersByMonth = async (req, res, next) => {
	//check if month params is valid
	if (monthName(req.params.month * 1) === undefined) {
		return next(
			new AppError(
				`Tháng truyền vào không hợp lệ: ${req.params.month}`,
				401
			)
		);
	}

	//get all soldProducts
	let soldProducts = await getSoldProducts(User);

	//get top 5 by month
	soldProducts = getBy('month', soldProducts, req.params.month);
	let top5ByMonth = [];
	for (let i = 0; i < 5; i++) {
		top5ByMonth.push(soldProducts[i]);
	}

	res.status(200).json({
		status: 'success',
		lenght: top5ByMonth.length,
		data: {
			top5ByMonth,
		},
	});
};

exports.getTop5BestSellersByYear = async (req, res, next) => {
	//check if year params is valid
	if (Number.isNaN(+req.params.year)) {
		return next(
			new AppError(`Năm truyền vào không hợp lệ: ${req.params.year}`, 401)
		);
	}

	//get all soldProducts
	let soldProducts = await getSoldProducts(User);

	//get top 5 by year
	soldProducts = getBy('year', soldProducts, req.params.year);
	let top5ByYear = [];
	for (let i = 0; i < 5; i++) {
		top5ByYear.push(soldProducts[i]);
	}

	res.status(200).json({
		status: 'success',
		lenght: top5ByYear.length,
		data: {
			top5ByYear,
		},
	});
};

exports.getProductsSoldInMonth = async (req, res, next) => {
	//check if month params is valid
	if (monthName(req.params.month * 1) === undefined) {
		return next(
			new AppError(
				`Tháng truyền vào không hợp lệ: ${req.params.month}`,
				401
			)
		);
	}

	//get all soldProducts
	let soldProducts = await getSoldProducts(User);

	//get by month
	soldProducts = getBy('month', soldProducts, req.params.month);

	res.status(200).json({
		status: 'success',
		lenght: soldProducts.length,
		data: {
			soldProducts,
		},
	});
};

exports.getProductsSoldInYear = async (req, res, next) => {
	//check if year params is valid
	if (Number.isNaN(+req.params.year)) {
		return next(
			new AppError(`Năm truyền vào không hợp lệ: ${req.params.year}`, 401)
		);
	}

	//get all soldProducts
	let soldProducts = await getSoldProducts(User);

	//get by year
	soldProducts = getBy('year', soldProducts, req.params.year);

	res.status(200).json({
		status: 'success',
		lenght: soldProducts.length,
		data: {
			soldProducts,
		},
	});
};

exports.getProductsSoldByEachMonthInYear = async (req, res, next) => {
	//check if year params is valid
	if (Number.isNaN(+req.params.year)) {
		return next(
			new AppError(`Năm truyền vào không hợp lệ: ${req.params.year}`, 401)
		);
	}

	//get all soldProducts of that year(no group)
	const users = await User.find();
	let soldProducts = [];
	users.forEach((el) => {
		el.purchasingHistory.forEach((order) => {
			order.items.forEach((item) => {
				const splitedYear = order.date
					.toDateString()
					.split(order.date.toDateString().substring(0, 11));
				if (splitedYear[1] * 1 === req.params.year * 1) {
					soldProducts.push({
						productId: item.productId,
						productName: item.productName,
						qty: item.qty,
						date: order.date,
						dateConverted: order.date.toDateString(), //vd: Thu Sep 12 2021
					});
				}
			});
		});
	});

	//assign month values
	let months = [
		{ month: 'Tháng 01', value: 0 },
		{ month: 'Tháng 02', value: 0 },
		{ month: 'Tháng 03', value: 0 },
		{ month: 'Tháng 04', value: 0 },
		{ month: 'Tháng 05', value: 0 },
		{ month: 'Tháng 06', value: 0 },
		{ month: 'Tháng 07', value: 0 },
		{ month: 'Tháng 08', value: 0 },
		{ month: 'Tháng 09', value: 0 },
		{ month: 'Tháng 10', value: 0 },
		{ month: 'Tháng 11', value: 0 },
		{ month: 'Tháng 12', value: 0 },
	];

	////fill sold products to each month in that year
	months.forEach((mo) => {
		monthInNumber = mo.month.slice(-2) * 1;
		soldProducts.forEach((el) => {
			if (monthExtractedToNumber(el) === monthInNumber)
				mo.value += el.qty;
		});
	});

	res.status(200).json({
		status: 'success',
		data: {
			soldProducts,
			months,
		},
	});
};
