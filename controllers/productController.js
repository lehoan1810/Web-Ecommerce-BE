const Product = require('./../models/productModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//get all products
exports.getAllProducts = catchAsync(async (req, res, next) => {
	//create instance of Product model to get origin length
	const lengthProductOrigin = (await Product.find()).length;

	//executing query
	const features = new APIFeatures(
		Product.find(),
		req.query,
		lengthProductOrigin
	)
		.filter()
		.sort()
		.limitFields()
		.paginate();
	const products = await features.mongooseQuery;

	//Send response
	res.status(200).json({
		status: 'success',
		results: products.length,
		data: {
			products,
		},
	});
});

//get product by id
exports.getProductById = catchAsync(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return next(new AppError('No product found with this ID', 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			product,
		},
	});
});

//get product by name (warning)
exports.getProductByName = catchAsync(async (req, res, next) => {
	const product = await Product.find({ name: { $regex: req.params.name } });

	if (!product) {
		return next(new AppError('No product found with this name', 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			product,
		},
	});
});

//Create new product
exports.createProduct = catchAsync(async (req, res, next) => {
	const newProduct = await Product.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {
			product: newProduct,
		},
	});
});

//Update a product
exports.updateProduct = catchAsync(async (req, res, next) => {
	const newProduct = await Product.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!newProduct) {
		return next(new AppError(`No product found with this ID`, 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			product: newProduct,
		},
	});
});

//Delete a product
exports.deleteProduct = catchAsync(async (req, res, next) => {
	const product = await Product.findByIdAndDelete(req.params.id);

	if (!product) {
		return next(new AppError(`No product found with this ID`, 404));
	}

	res.status(204).json({
		status: 'success',
		data: null,
	});
});
