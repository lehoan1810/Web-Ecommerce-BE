const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

//Create router for user
const router = express.Router();

//Routes of users as customer
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
	"/updateMyPassword",
	authController.protect,
	authController.updatePassword
);

// test getUser
router.get("/profile/:id", authController.protect, userController.getOneUser);
//

router.patch("/updateMe", authController.protect, userController.updateMe);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

//Routes of users as assistant/admin (not yet completed)
// getAllCustomer
router.get(
	"/getAllCustomer",
	authController.protect,
	userController.getAllCustomer
);

//getAllAssistant
router.get(
	"/getAllAssistant",
	authController.protect,
	userController.getAllAssistant
);

//Admin Delete User
router.delete(
	"/deleteCustomer/:id",
	authController.protect,
	userController.deleteCustomer
);
//
router
	.route("/")
	.get(authController.protect, userController.getAllUsers)
	.post(userController.createUser);
// router
// 	.route("/:id")
// 	.get(userController.getUser)
// 	.patch(userController.updateUser)
// 	.delete(userController.deleteUser);

//export for using in app
module.exports = router;
