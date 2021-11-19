const express = require("express");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const categoryRouters = require("./routes/category");
const productRouters = require("./routes/productSP");
const brandRouters = require("./routes/brand");
const reviewRouter = require("./routes/reviewRoutes");
const cartRouter = require("./routes/cartRoutes");

//create instance for appication of express
const app = express();

//middle preventing cors error
app.use(cors());

//middleware for static files
app.use(express.static(`${__dirname}/public`));

//middleware for parsing request body to json
app.use(express.json());

//middleware for tour, user router
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/category", categoryRouters);
app.use("/api/v1/category", productRouters);
app.use("/api/v1/category", brandRouters);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/cart", cartRouter);

//middleware for not found page
app.all("*", (req, res, next) => {
	next(new AppError(`Not found page (${req.originalUrl}, ${req.url})`, 404));
});

//middleware error handling
app.use(globalErrorHandler);

//export for using in server
module.exports = app;
