const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

// 1) FOR CUSTOMER
//Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
	const role = "customer";
	const users = await User.find({ role });

	//Send response
	res.status(200).json({
		status: "success",
		results: users.length,
		data: {
			users,
		},
	});
});

//getAllCustomer
//Get all users
exports.getAllCustomer = catchAsync(async (req, res, next) => {
	const role = "customer";
	const users = await User.find({ role });

	//Send response
	res.status(200).json({
		status: "success",
		results: users.length,
		data: {
			users,
		},
	});
});

exports.getAllAssistant = catchAsync(async (req, res, next) => {
	const role = "assistant";
	const users = await User.find({ role });

	//Send response
	res.status(200).json({
		status: "success",
		results: users.length,
		data: {
			users,
		},
	});
});

//profile User
exports.getOneUser = catchAsync(async (req, res, next) => {
	const userData = await User.findById(req.user.id);
	console.log(userData);
	console.log("User là :", User);
	console.log(req.user);
	res.status(200).json({
		status: "success",
		data: {
			userData,
		},
	});
});

//Update current user
exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if user POSTs password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				"This route is not for password updates. Please use /updateMyPassword.",
				400
			)
		);
	}

	// 2) Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(
		req.body,
		"name",
		"email",
		"phone",
		"photo",
		"address",
		"gender"
	);

	// 3) Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: "success",
		data: {
			user: updatedUser,
		},
	});
});

//Delete current user
exports.deleteMe = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.user.id, { active: false });
	res.status(204).json({
		status: "success",
		data: null,
	});
});
// delete
exports.deleteCustomer = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);
	console.log(user);
	res.status(200).json({
		status: "xóa tài khoản thành công",
	});
});

// 2) FOR ADMIN (NOT COMPLETED YET)
//Get one user
exports.getUser = (req, res) => {
	res.status(500).json({
		status: "error",
		message: "This route is not yet defined!",
	});
};
//Create new user
exports.createUser = (req, res) => {
	res.status(500).json({
		status: "error",
		message: "This route is not yet defined!",
	});
};
//Update a user
exports.updateUser = (req, res) => {
	res.status(500).json({
		status: "error",
		message: "This route is not yet defined!",
	});
};
//Delete a user
exports.deleteUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	res.status(200).json({
		status: "ok",
		value: user,
	});
});
