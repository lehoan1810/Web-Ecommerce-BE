const Product = require("../models/productSP");
const slugif = require("slugify");
const category = require("../models/category");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("./../utils/appError");
const lodash = require("lodash");

exports.createProduct = (req, res) => {
	const {
		name,
		price,
		description,
		productPicture,
		category,
		specification,
		createdBy,
	} = req.body;

	const product = new Product({
		name: req.body.name,
		slug: slugif(name),
		price,
		description,
		productPicture,
		category,
		specification,
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
exports.getProductDetail = catchAsync(async (req, res, next) => {
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

// sort product
exports.sortProductMinMax = async (req, res) => {
	const { id } = req.params;
	let sortProduct = [];
	// let test = [];
	category.findOne({ _id: id }).exec((error, category) => {
		if (error) {
			return res.status(400).json({ error });
		}
		// return res.status(200).json({ category });

		if (category) {
			Product.find({ category: category._id })
				.sort({ price: 1 })
				.limit(8)
				.exec((error, products) => {
					sortProduct = products.sort((a, b) => a.price - b.price);

					res.status(200).json({
						sortProduct,
					});
				});
		}
	});
};

exports.sortProductMaxMin = (req, res) => {
	const { id } = req.params;
	// let sortProduct = [];
	// let test = [];
	category.findOne({ _id: id }).exec((error, category) => {
		if (error) {
			return res.status(400).json({ error });
		}
		// return res.status(200).json({ category });

		if (category) {
			Product.find({ category: category._id })
				.sort({ price: -1 })
				.limit(8)
				.exec((error, sortProduct) => {
					// sortProduct = products.sort((a, b) => b.price - a.price);

					res.status(200).json({
						sortProduct,
					});
				});
		}
	});
};
// sort between two price
exports.sortTwoPrice = (req, res) => {
	const { id } = req.params;
	const { min, max } = req.query.price;
	console.log(req.query.price);
	category.findOne({ _id: id }).exec((error, category) => {
		if (error) {
			return res.status(400).json({ error });
		}
		if (category) {
			Product.find({ category: category._id }).exec((error, products) => {
				let sortProduct = products.filter(
					(item) => item.price >= parseInt(min) && item.price <= parseInt(max)
				);
				res.status(200).json({
					sortProduct,
				});
			});
		}
	});
};
// Pagination
exports.paginationProducts = (req, res, next) => {
	let perPage = parseInt(req.query.size);
	let page = parseInt(req.query.page) || 1;
	const { id } = req.params;
	console.log(perPage);
	category.findOne({ _id: id }).exec((error, category) => {
		if (error) {
			return res.status(400).json({ error });
		}
		if (category) {
			Product.find({ category: category._id })
				.skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
				.limit(perPage)
				.exec((err, products) => {
					Product.find({ category: category._id }).countDocuments(
						(err, count) => {
							// đếm để tính có bao nhiêu trang
							if (err) return next(err);
							res.status(200).json({
								products, // product one page
								current: page,
								pages: Math.ceil(count / perPage), // total page
							});
						}
					);
				});
		}
	});
};
