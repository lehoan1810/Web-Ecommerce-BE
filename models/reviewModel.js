const mongoose = require("mongoose");
const validator = require("validator");
const Product = require("./productSP");

const reviewSchema = new mongoose.Schema(
	{
		review: {
			type: String,
			require: [true, "Review can not be empty"],
		},
		rating: {
			type: Number,
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating must be at most 5"],
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		product: {
			type: mongoose.Schema.ObjectId,
			ref: "productSP",
			require: [true, "Review must belong to a product"],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			require: [true, "Review must belong to a user"],
		},
		name: {
			type: String,
			require: true,
		},
		photo: {
			type: String,
			require: true,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

//QUERY MIDDLEWARE
// reviewSchema.pre(/^find/, function (next) {
// 	this.populate({
// 		path: "user",
// 		select: "name ",
// 	});
// 	next();
// });

//STATIC METHOD
reviewSchema.statics.calcAverageRatings = async function (productId) {
	//tính các thông số cho 1 product đó
	const stats = await this.aggregate([
		{
			$match: { product: productId },
		},
		{
			$group: {
				_id: "$product",
				numRatings: { $sum: 1 },
				avgRating: { $avg: "$rating" },
			},
		},
	]);

	if (stats.length > 0) {
		await Product.findByIdAndUpdate(productId, {
			ratingsQuantity: stats[0].numRatings,
			ratingsAverage: stats[0].avgRating,
		});
	} else {
		await Product.findByIdAndUpdate(productId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5,
		});
	}
};

reviewSchema.post("save", function () {
	this.constructor.calcAverageRatings(this.product);
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
// 	this.r = await this.findOne();
// 	next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
// 	await this.r.constructor.calcAverageRatings(this.r.product);
// });

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
	await doc.constructor.calcAverageRatings(doc.product);
	next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
