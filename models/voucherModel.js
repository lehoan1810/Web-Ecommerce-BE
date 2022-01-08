const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
	code: {
		type: String,
	},
	discountPercent: {
		type: Number,
	},
	describe: {
		type: String,
	},
	valid: {
		type: Boolean,
	},
});

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
