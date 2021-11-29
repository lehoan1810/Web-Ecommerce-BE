const paypal = require("paypal-rest-sdk");
const User = require("../models/userModel");
// const Product = require("../models/productSP");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const validateCart = require("./../utils/validateCart");

const axios = require("axios");

paypal.configure({
	mode: "sandbox", //sandbox or live
	client_id:
		"AWxTFB9e_bKvYjweAF5cvUeSCSEvgRPHsbY1ap1-U6sO16RzP8I3JPhoGMqKmzKITzbW82MdOvYYj-n3",
	client_secret:
		"EIDYSpstuOmwiR7bSeIQMrsCpEYJ7REfGMuWbrVfMWTF-LtUqbSupkvUIq5H8iGvGho5kdeB2mDc3BJr",
});

let convertedTotalPrice = 0;
let user = {};

exports.purchase = catchAsync(async (req, res, next) => {
	// 1) Lấy thông tin user và thông tin giỏ hàng
	user = await User.findById(req.user.id);
	// user = await User.findById(req.params.userId);
	const cart = user.cart;
	const cartItems = cart.items;

	validateCart(user);
	await user.save();

	// 2) lấy thông tin rate 1 USD = ? VND
	const exchangeUrl = `https://openexchangerates.org/api/latest.json?app_id=${process.env.OPENEXCHANGERATES_APP_ID}`;
	const asyncGetRates = async () => {
		const data = await axios.get(exchangeUrl);
		return data.data.rates.VND;
	};
	const exchangeRate = await asyncGetRates();
	console.log("exchangeRate: ", exchangeRate);

	// 3) đổi price VND>USD mỗi sp; gán thông tin cần thiết để thực hiện th.toán cho transaction items vào convertedItems
	// đồng thời tính toán lại totalPrice sang USD (convertedTotalPrice)
	let convertedItems = [];
	cartItems.forEach((item) => {
		convertedItems.push({
			name: item.productName,
			sku: item.productId + "",
			price: Math.round(item.price / exchangeRate),
			currency: "USD",
			quantity: item.qty,
		});
		convertedTotalPrice += Math.round(item.price / exchangeRate) * item.qty;
	});
	console.log("convertedItems: ", convertedItems);
	console.log("convertedTotalPrice (pay): ", convertedTotalPrice);

	// 4) tạo biến mẫu paypal để giao dịch có items, total là convertedItems, convertedTotalPrice đã tính ở trên
	const create_payment_json = {
		intent: "sale",
		payer: {
			payment_method: "paypal",
		},
		redirect_urls: {
			return_url: `${req.protocol}://${req.get("host")}/api/v1/pay/success`,
			cancel_url: `${req.protocol}://${req.get("host")}/api/v1/pay/cancel`,
			// return_url: 'http://localhost:3000/api/v1/pay/success',
			// cancel_url: 'http://localhost:3000/api/v1/pay/cancel',
		},
		transactions: [
			{
				item_list: {
					items: convertedItems,
				},
				amount: {
					currency: "USD",
					total: convertedTotalPrice,
				},
				description: "Hat for the best team ever",
			},
		],
	};

	// 5) chuyển đến trang giao dịch;
	paypal.payment.create(create_payment_json, (error, payment) => {
		if (error) {
			console.log(error);
			return next(new AppError("Something went wrong while paying", 400));
			// res.render('cancel');
		} else {
			for (let i = 0; i < payment.links.length; i++) {
				if (payment.links[i].rel === "approval_url") {
					res.redirect(payment.links[i].href);
				}
			}
			// console.log(payment);
		}
	});
});

// Method khi đã chuyến đến trang giao dịch (sau khi chuyển đến trang giao dịch và bấm thanh toán)
exports.getSuccess = catchAsync(async (req, res, next) => {
	console.log("convertedTotalPrice (success): ", convertedTotalPrice);

	console.log("user (success): ");
	console.log(user);

	// 1) lấy thông tin thanh toán
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		payer_id: payerId,
		transactions: [
			{
				amount: {
					currency: "USD",
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
				res.render("cancel");
			} else {
				console.log("Get payment response: ");
				console.log(JSON.stringify(payment));

				//SUCCESS rồi thì:
				// 1) thêm vào lịch sử mua hàng
				let name = [
					payment.payer.payer_info.first_name,
					payment.payer.payer_info.last_name,
				].join(" ");
				let shippingAddress = [
					payment.payer.payer_info.shipping_address.line1,
					payment.payer.payer_info.shipping_address.line2,
					payment.payer.payer_info.shipping_address.city,
					payment.payer.payer_info.shipping_address.state,
					payment.payer.payer_info.shipping_address.country_code,
				].join(", ");

				user.purchasingHistory.push({
					items: user.cart.items,
					totalPrice: user.cart.totalPrice,
					name: name,
					shippingAddress: shippingAddress,
				});
				// 2) làm rỗng cart
				user.cart.items = [];
				user.cart.totalPrice = 0;
				// 3) save lại
				await user.save();

				res.render("success");
			}
		}
	);
});

// Vào đây nếu cancel giao dịch (không muốn thanh toán giữa chừng)
exports.getCancel = catchAsync(async (req, res, next) => {
	res.send("Cancelled payment");
});
