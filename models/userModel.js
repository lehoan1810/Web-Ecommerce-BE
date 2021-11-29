const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Product = require("./../models/productSP");
const AppError = require("../utils/appError");
const validateCart = require("./../utils/validateCart");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			require: [true, "Please give us your name"],
		},
		email: {
			type: String,
			require: [true, "Please give us your email"],
			unique: [true, "Email must be unique"],
			lowercase: true,
			validate: [validator.isEmail, "Please provide a valid email"],
		},
		password: {
			type: String,
			require: [true, "Please provide us your password"],
			minlength: [8, "Password must be at least 8 characters"],
			select: false, //make this field is not visible in any output
		},
		passwordConfirm: {
			type: String,
			require: [true, "Please confirm your password"],
			validate: {
				validator: function (elm) {
					return elm === this.password;
				},
				message: "Passwords are not the same",
			},
		},
		photo: {
			type: String,
			default: "",
		},
		address: {
			type: String,
			default: "",
		},
		phone: {
			type: String,
			default: "",
		},
		gender: {
			type: String,
			default: "",
		},

		role: {
			type: String,
			enum: ["customer", "assistant", "admin"],
			default: "customer",
		},
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false,
		},

		//chỉnh sửa
		cart: {
			items: [
				{
					productId: {
						type: mongoose.Types.ObjectId,
						ref: "productSP",
						required: true,
					},
					price: {
						type: Number,
						required: true,
					},
					nameProduct: {
						type: String,
						required: true,
					},
					productPicture: {
						type: String,
						required: true,
					},
					qty: {
						type: Number,
						required: true,
					},
				},
			],
			totalPrice: { type: Number },
		},
		//
		purchasingHistory: [
			{
				date: {
					type: Date,
					default: Date.now,
				},
				items: [
					{
						productId: {
							type: mongoose.Types.ObjectId,
							ref: "productSP",
							required: true,
						},
						productName: {
							type: String,
						},
						price: {
							type: Number,
							required: true,
						},
						qty: {
							type: Number,
							required: true,
						},
					},
				],
				name: {
					type: String,
				},
				shippingAddress: {
					type: String,
				},
				totalPrice: {
					type: Number,
				},
			},
		],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// userSchema.pre("save", async function (next) {}),
//hash password before actually saving to the db
userSchema.pre("save", async function (next) {
	//only run this function if password is modified
	if (!this.isModified("password")) {
		return next();
	}

	//hash password with cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	//delete passwordConfirm because no longer need to be persisted in db anymore
	this.passwordConfirm = undefined;

	next();
});

//add value to passwordChangedAt before password (but not rest of other fields) is changed
userSchema.pre("save", async function (next) {
	//check if user is new or not recently changed password
	if (!this.isModified("password") || this.isNew) {
		return next();
	}

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

//hide users which is inactive
userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } });
	next();
});

//method to check if password is correct before actually logging in
userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

//method to check if password is changed after logging in, if not, restrict the actions
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);

		return JWTTimestamp < changedTimestamp;
	}

	// False means NOT changed
	return false;
};

//method to create reset password token
userSchema.methods.createResetPasswordToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// console.log({
	// 	resetToken,
	// 	encryptedResetToken: this.passwordResetToken,
	// });

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

//
//method to validate cart
userSchema.methods.getCart = async function () {
	await validateCart(this);

	return await this.save();
};

//method to addToCart
userSchema.methods.addToCart = async function (productId, qtyy) {
	await validateCart(this);
	const product = await Product.findById(productId);

	if (product) {
		//check if passed product has in current cart
		const isExisting = this.cart.items.findIndex(
			(item) =>
				new String(item.productId).trim() === new String(product.id).trim()
		);

		//if so
		if (isExisting >= 0) {
			this.cart.items[isExisting].qty += qtyy;
			this.cart.items[isExisting].price = product.price;
			this.cart.items[isExisting].nameProduct = product.name;
		}
		//if not
		else {
			this.cart.items.push({
				productId: product.id,
				price: product.price,
				productPicture: product.productPicture,
				nameProduct: product.name,
				qty: qtyy,
			});
		}
		if (!this.cart.totalPrice) {
			this.cart.totalPrice = 0;
		}
		this.cart.totalPrice += product.price * qtyy;
		return await this.save();
	}
};

//method to decrease cart
userSchema.methods.decreaseFromCart = async function (productId, qtyy) {
	await alidateCart(this);

	//set totalPrice is 0 if no items in cart
	if (this.cart.items.length === 0) {
		this.cart.totalPrice = 0;
	}

	const product = await Product.findById(productId);
	//check if passed product has in current cart
	if (product) {
		const isExisting = this.cart.items.findIndex(
			(item) =>
				new String(item.productId).trim() === new String(product.id).trim()
		);

		//if so
		if (isExisting >= 0) {
			//check if qty of product is greater than 1, if so, decrease the qty & update the totalPrice
			if (this.cart.items[isExisting].qty > 1) {
				this.cart.items[isExisting].qty -= qtyy;
				this.cart.totalPrice -= this.cart.items[isExisting].price;

				//set totalPrice is 0 if no items in cart
				if (this.cart.items.length === 0) {
					this.cart.totalPrice = 0;
				}
				return await this.save();
			}
			//if not (<=1), go to this.removeFromCart
			else {
				this.removeFromCart(product.id);
			}
		}
	}
};

//method to remove cart
userSchema.methods.removeFromCart = async function (productId) {
	await validateCart(this);
	if (this.cart.items.length === 0) {
		this.cart.totalPrice = 0;
	}
	const isExisting = this.cart.items.findIndex(
		(item) => new String(item.productId).trim() === new String(productId).trim()
	);
	if (isExisting >= 0) {
		// this.cart.items[isExisting].qty += 1;

		this.cart.totalPrice -=
			this.cart.items[isExisting].price * this.cart.items[isExisting].qty;
		this.cart.items.splice(isExisting, 1);

		//set totalPrice is 0 if no items in cart
		if (this.cart.items.length === 0) {
			this.cart.totalPrice = 0;
		}
		return await this.save();
	}
};

const User = mongoose.model("User", userSchema);

module.exports = User;
