const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		//get length of document in this collection
		const lengthOrigin = (await Model.find()).length;

		//filter for nested tours/:tourId/reviews/ (hack)
		let filter = {};
		if (req.params.tourId) filter = { tour: req.params.tourId };

		console.log('req.query: ', req.query);

		//executing query
		const features = new APIFeatures(
			Model.find(filter),
			req.query,
			lengthOrigin
		)
			.filter()
			.sort()
			.limitFields()
			.paginate();
		// const docs = await features.mongooseQuery.explain();
		const docs = await features.mongooseQuery;

		//Send response
		res.status(200).json({
			status: 'success',
			results: docs.length,
			requestAt: req.requestTime,
			data: {
				data: docs,
			},
		});
	});

exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);

		const doc = await query;
		//or const newdoc = await Product.find({ _id: req.params.id})

		if (!doc) {
			return next(new AppError(`No document found with this ID`, 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});

exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		// const newProduct = new Product({})
		// newProduct.save()

		const doc = await Model.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				doc: doc,
			},
		});
	});

exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(new AppError(`No document found with this ID`, 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});

exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError(`No document found with this ID`, 404));
		}

		res.status(204).json({
			status: 'success',
			data: null,
		});
	});
