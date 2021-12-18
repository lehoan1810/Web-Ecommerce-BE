const express = require('express');
const statisticsController = require('../controllers/statisticsController');
const authController = require('../controllers/authController');

//Create router for review
const router = express.Router({ mergeParams: true });

//Routes of statistic
// 1) Thống kê top 5 sản phẩm (đã xếp sẵn từ bán nhìu nhất tới thấp nhất)
//   1.1) theo tháng... (nhập tháng bằng số vào params :month)
router
	.route('/top5bestsellers/month/:month')
	.get(statisticsController.getTop5BestSellersByMonth);
//   1.2) theo năm... (nhập năm bằng số vào params :year)
router
	.route('/top5bestsellers/year/:year')
	.get(statisticsController.getTop5BestSellersByYear);

// 2) Thống kê những phẩm bán được
//   2.1) trong tháng... (nhập tháng bằng số vào params :month)
router
	.route('/productssoldin/month/:month')
	.get(statisticsController.getProductsSoldInMonth);
//   2.2) trong năm... (nhập năm bằng số vào params :year)
router
	.route('/productssoldin/year/:year')
	.get(statisticsController.getProductsSoldInYear);

// 3) Thống kê những sản phẩm bán được trong từng tháng của năm nhập vào
//   3.1) trong năm... (nhập năm bằng số vào params :year)
router
	.route('/:year')
	.get(statisticsController.getProductsSoldByEachMonthInYear);

//export for using in app
module.exports = router;
