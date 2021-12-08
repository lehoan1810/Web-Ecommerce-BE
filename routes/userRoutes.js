const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//Create router for user
const router = express.Router();

//Routes of users as customer
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
	'/updateMyPassword',
	authController.protect,
	authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

// test getUser
router.get('/profile/:id', authController.protect, userController.getOneUser);

//Routes of users as assistant/admin
// getAllCustomer
router.get(
	'/getAllCustomer',
	authController.protect,
	authController.restrictTo('admin', 'assistant'),
	userController.getAllCustomer
);

// getAllAssistant
router.get(
	'/getAllAssistant',
	authController.protect,
	authController.restrictTo('admin', 'assistant'),
	userController.getAllAssistant
);

// delete User
router.delete(
	'/deleteCustomer/:id',
	authController.protect,
	authController.restrictTo('admin', 'assistant'),
	userController.deleteCustomer
);

// getAllUsers
router
	.route('/')
	.get(
		authController.protect,
		authController.restrictTo('admin', 'assistant'),
		userController.getAllUsers
	)
	.post(userController.createUser);

// router
// 	.route("/:id")
// 	.get(userController.getUser)
// 	.patch(userController.updateUser)
// 	.delete(userController.deleteUser);

//export for using in app
module.exports = router;
