const mongoose = require('mongoose');
const productSPShema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
		},
		price: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},
		specification: {
			type: String,
			trim: true,
		},
		productPicture: {
			type: String,
			default: '',
		},
		ratingsQuantity: {
			type: Number,
			default: 0,
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating must be above 1'],
			max: [5, 'Rating must be below 5'],
			set: (val) => Math.round(val * 10) / 10,
		},

		// reviews: [
		// 	{
		// 		userId: {
		// 			type: mongoose.Schema.Types.ObjectId,
		// 			ref: "User",
		// 		},
		// 		type: mongoose.Schema.Types.ObjectId,
		// 		ref: "Reviews",
		// 	},
		// ],
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'category',
			required: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true }
);

// productSPShema.index({ slug: 1 });

//VIRTUAL POPULATE
productSPShema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'product',
	localField: '_id',
});
productSPShema.set('toObject', { virtuals: true });
productSPShema.set('toJSON', { virtuals: true });

//DOCUMENT MIDDLEWARE: slug
// productSPShema.pre("save", function (next) {
// 	this.slug = slugify(this.name, { lower: true });
// 	next();
// });

module.exports = mongoose.model('productSP', productSPShema);
