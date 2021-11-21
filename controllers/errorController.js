//xu ly loi sau khi da define loi
const AppError = require("./../utils/appError");

const handleCastErrorDB = (error) => {
	const message = `Invalid ${error.path}: ${error.value}.`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
	//const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0]; (no longer correct)
	const key = Object.keys(error.keyValue).join("");
	const message = `The key '${key}' has duplicate value of '${error.keyValue[key]}'`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
	const message = Object.values(error.errors)
		.map((elm) => elm.message)
		.join(". ");
	console.log(message);
	console.log("////");
	return new AppError(message, 400);
};

const handleJWTError = () =>
	new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
	new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

sendDevError = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

sendProdError = (err, res) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
		});
	}
	// Programming or other unknown error: don't leak error details
	else {
		// 1) Log error
		console.error("ERROR 💥", err);

		// 2) Send generic message
		res.status(500).json({
			status: "error",
			message: "Something went very wrong! @.@",
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = { ...err };

		console.log("err: ");
		console.log(error);
		console.log("////");

		if (err.name === "CastError") {
			error = handleCastErrorDB(error);
		}

		if (err.code === 11000) {
			error = handleDuplicateFieldsDB(error);
		}

		if (err.name === "ValidationError") {
			error = handleValidationErrorDB(error);
		}

		if (err.name === "JsonWebTokenError") error = handleJWTError();
		if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
		//more and more error your own handler here....

		sendProdError(error, res);
	}
};
