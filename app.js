const express = require('express');
const cors = require('cors');
const AppError = require('./utils/appError');
const compression = require('compression');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const categoryRouters = require('./routes/category');
const productRouters = require('./routes/productSP');
const reviewRouter = require('./routes/reviewRoutes');
const cartRouter = require('./routes/cartRoutes');
const purchasingRouter = require('./routes/purchasingRoutes');
const orderRouter = require('./routes/orderRoutes');
const ejs = require('ejs');
//create instance for appication of express
const app = express();

//middle preventing cors error
app.use(cors());

//middleware for static files
app.use(express.static(`${__dirname}/public`));

//middleware for parsing request body to json
app.use(express.json());
app.use(compression());

//middleware for tour, user router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/category', categoryRouters);
app.use('/api/v1/category', productRouters);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);

app.set('view engine', 'ejs');
app.use('/api/v1/pay', purchasingRouter);

app.use('/api/v1/orders', orderRouter);

//middleware for not found page
app.all('*', (req, res, next) => {
	next(new AppError(`Not found page (${req.originalUrl}, ${req.url})`, 404));
});

//middleware error handling
app.use(globalErrorHandler);

//export for using in server
module.exports = app;
