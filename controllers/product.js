const Product = require("../models/productSP");
const slugif = require("slugify");
const category = require("../models/category");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const lodash = require("lodash");

exports.createProduct = (req, res) => {
	const { name, price, description, productPicture, category, createdBy } =
		req.body;

	const product = new Product({
		name: req.body.name,
		slug: slugif(name),
		price,
		description,
		productPicture,
		category,
		// reviews: req.body.reviews,
		createdBy: req.user._id,
	});
	product.save((error, product) => {
		if (error) return res.status(400).json({ error });
		if (product) {
			res.status(201).json({ product });
		}
	});
};

// getProduct by idBrand
exports.getProductsById = (req, res) => {
	const { id } = req.params;

	category.findOne({ _id: id }).exec((error, category) => {
		if (error) {
			return res.status(400).json({ error });
		}
		// return res.status(200).json({ category });

		if (category) {
			Product.find({ category: category._id }).exec((error, products) => {
				res.status(200).json({
					products,
				});
			});
			// return res.status(200).json({ category });
		}
	});
};
// exports.getProductDetail = factory.getOne(Product, { path: "reviews" });
exports.getProductDetail = catchAsync(async (req, res, next) => {
	// const { id } = req.params;
	// let query = Product.findOne({ _id: id });
	// if ({ path: "reviews" }) query = query.populate({ path: "reviews" });
	// const doc = await query;
	// res.status(200).json({
	// 	status: "success",
	// 	data: {
	// 		data: doc,
	// 	},
	// });
	const { id } = req.params;
	Product.findOne({ _id: id })
		.populate({ path: "reviews" })
		.exec((error, product) => {
			if (error) {
				return res.status(400).json({ error });
			}
			return res.status(200).json({ product });
		});
});

// update product
exports.updateProductById = catchAsync(async (req, res, next) => {
	const newProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!newProduct) {
		return next(new AppError(`No product found with this ID`, 404));
	}

	res.status(200).json({
		status: "success",
		data: {
			product: newProduct,
		},
	});
});

// Delete Product
exports.deleteProductById = catchAsync(async (req, res, next) => {
	const product = await Product.findByIdAndDelete(req.query.id);

	if (!product) {
		return next(new AppError(`No product found with this ID`, 404));
	}

	res.status(204).json({
		status: "success",
		data: null,
	});
});

// get all product

exports.getAllProducts = (req, res, next) => {
	category.find({}).exec((error, category) => {
		if (error) {
			return res.status(400).json({ error });
		}
		// return res.status(200).json({ category });

		if (category) {
			Product.find({}).exec((error, allProducts) => {
				res.status(200).json({
					status: "success",
					lenght: allProducts.length,
					allProducts,
				});
			});
		}
	});
};

// get 5 Products New
const sortByDate = (orders, query, role) => {
	orders = lodash.orderBy(
		orders,
		[(order) => new Date(role === "customer" ? order.date : order.order.date)], //
		query === "-date" ? ["asc"] : ["desc"]
	);

	return orders;
};
exports.get5ProductsNew = catchAsync(async (req, res, next) => {
	category.find({}).exec((error, category) => {
		if (error) {
			return res.status(400).json({ error });
		}
		// return res.status(200).json({ category });

		if (category) {
			Product.find({})
				.sort({ createdAt: -1 })
				// .sort({ date: -1 })
				.limit(5)
				.exec((error, products) => {
					res.status(200).json({
						lenght: products.length,
						products,
					});
				});
		}
	});
});
