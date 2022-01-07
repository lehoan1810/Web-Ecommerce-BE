const paypal = require('paypal-rest-sdk');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const validateCart = require('../utils/validateCart');
const User = require('../models/userModel');

const axios = require('axios');
paypal.configure({
	mode: 'sandbox',
	client_id:
		'AQiKeN030h5sXtw1TDOw0l7u4Bo8KINbSNFZCE-gSX4R0XenEyI6eQAcJcr0Oez_2JM74T5Dc9LvpW7n',
	client_secret:
		'ECBxsoE56ZVQyhBWR15KZ_Z0s18aRHaR9jrCposcw_Aj0GiRRjq1v3SmkfGB1JyGiBkklEfuQlbSoGuV',
});

const discountHandler = (convertedTotalPrice) => {
	if (convertedTotalPrice >= 878) {
		return {
			discountPercent: 0.2,
			message: 'Giam 20% cho don hang tren 20 trieu dong',
			sku: 'HQHDISFR20MIVN',
		};
	} else if (convertedTotalPrice >= 350) {
		return {
			discountPercent: 0.13,
			message: 'Giam 13% cho don hang tren 8 trieu dong',
			sku: 'HQHDISFR08MIVN',
		};
	} else if (convertedTotalPrice >= 220) {
		return {
			discountPercent: 0.1,
			message: 'Giam 10% cho don hang tren 5 trieu dong',
			sku: 'HQHDISFR05MIVN',
		};
	} else {
		return {
			message: 'Giam gia: 0vnd',
			sku: 'null',
			discountPercent: 0,
		};
	}
};

let convertedTotalPrice, exchangeRate;
let user = {};

exports.testPaypal = catchAsync(async (req, res, next) => {
	//reset
	convertedTotalPrice = 0;
	exchangeRate = 0;

	// 1) Lấy thông tin user và thông tin giỏ hàng
	user = await User.findById(req.params.id);

	validateCart(user);
	await user.save();

	var cartItems = user.cart.items;

	if (cartItems.length <= 0) return next(new AppError('Cart is empty!', 400));

	// 2) Chuyển VND sang USD
	const exchangeUrl =
		'https://openexchangerates.org/api/latest.json?app_id=964e2023a6b9427dbf728e0bcf1c5a9c';
	const asyncGetRates = async () => {
		const data = await axios.get(exchangeUrl);
		return data.data.rates.VND;
	};
	exchangeRate = await asyncGetRates();
	console.log('exchangeRate: ', exchangeRate);

	// 3) tạo itemss để cho vào items của transaction
	let itemss = [];
	cartItems.forEach((item) => {
		itemss.push({
			name: item.productName,
			sku: item.productId,
			price: Math.round(item.price / exchangeRate),
			currency: 'USD',
			quantity: item.qty,
		});
	});

	for (i = 0; i < itemss.length; i++) {
		convertedTotalPrice += parseFloat(itemss[i].price) * itemss[i].quantity;
	}

	// 4) quy định giảm giá (testing)
	const discountObj = discountHandler(convertedTotalPrice);

	let discount = -Math.floor(
		convertedTotalPrice * discountObj.discountPercent
	);
	itemss.push({
		name: discountObj.message,
		sku: discountObj.sku,
		price: discount,
		currency: 'USD',
		quantity: 1,
	});
	convertedTotalPrice += discount;

	// 5) tạo biến mẫu paypal để giao dịch có items, total là convertedItems, convertedTotalPrice đã tính ở trên
	var create_payment_json = {
		intent: 'sale',
		payer: {
			payment_method: 'paypal',
		},
		redirect_urls: {
			return_url: `${req.protocol}://${req.get(
				'host'
			)}/api/v1/pay/success`,
			cancel_url: `${req.protocol}://${req.get(
				'host'
			)}/api/v1/pay/cancel`,
			// return_url: "http://localhost:5000/api/v1/pay/success",
			// cancel_url: "http://localhost:5000/api/v1/pay/cancel",
		},
		transactions: [
			{
				item_list: {
					items: itemss,
				},
				amount: {
					currency: 'USD',
					total: convertedTotalPrice,
				},
				description: 'Hat for the best team ever',
			},
		],
	};

	// 6) chuyển đến trang giao dịch;
	paypal.payment.create(create_payment_json, (error, payment) => {
		if (error) {
			return next(new AppError('Something went wrong while paying', 400));
			// res.render('cancel');
		} else {
			for (let i = 0; i < payment.links.length; i++) {
				if (payment.links[i].rel === 'approval_url') {
					//res.redirect(payment.links[i].href);
					res.json({
						forwardLink: payment.links[i].href,
					});
				}
			}
		}
	});
});

// Method khi đã chuyến đến trang giao dịch (sau khi chuyển đến trang giao dịch và bấm thanh toán)
exports.getSuccess = catchAsync(async (req, res) => {
	// 1) lấy thông tin thanh toán
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		payer_id: payerId,
		transactions: [
			{
				amount: {
					currency: 'USD',
					total: convertedTotalPrice,
				},
			},
		],
	};

	// 2) thanh toán !
	paypal.payment.execute(
		paymentId,
		execute_payment_json,
		async function (error, payment) {
			if (error) {
				res.render('cancel');
			} else {
				//SUCCESS rồi thì:
				// 1) thêm vào lịch sử mua hàng
				let name = [
					payment.payer.payer_info.first_name,
					payment.payer.payer_info.last_name,
				].join(' ');
				let shippingAddress = [
					payment.payer.payer_info.shipping_address.line1,
					payment.payer.payer_info.shipping_address.line2,
					payment.payer.payer_info.shipping_address.city,
					payment.payer.payer_info.shipping_address.state,
					payment.payer.payer_info.shipping_address.country_code,
				].join(', ');

				user.purchasingHistory.push({
					items: user.cart.items,
					totalPrice: convertedTotalPrice * exchangeRate,
					name: name,
					shippingAddress: shippingAddress,
					status: 0,
				});
				// 2) làm rỗng cart
				user.cart.items = [];
				user.cart.totalPrice = 0;
				// 3) save lại
				await user.save();

				res.render('success');
			}
		}
	);
});

// Vào đây nếu cancel giao dịch (không muốn thanh toán giữa chừng)
exports.getCancel = catchAsync(async (req, res, next) => {
	res.send('Cancelled payment');
});
