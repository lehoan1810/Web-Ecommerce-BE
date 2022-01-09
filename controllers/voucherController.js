const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Voucher = require("../models/voucherModel");
const factory = require("./handlerFactory");

exports.getAllVouchers = factory.getAll(Voucher);

exports.createVoucher = factory.createOne(Voucher);

exports.updateVoucher = factory.updateOne(Voucher);

exports.deleteVoucher = factory.deleteOne(Voucher);

exports.getOneVoucher = catchAsync(async (req, res, next) => {
	const voucher = await Voucher.findOne({ code: req.params.voucherId });

	if (!voucher) return next(new AppError("This voucher does not exist!!", 400));

	res.status(200).json({
		status: "success",
		data: {
			voucher,
		},
	});
});
