const express = require("express");
const purchasingController = require("../controllers/purchasingController");
const authController = require("../controllers/authController");
const { testPaypal, getSuccess, getCancel } = require("../controllers/Paypal");

const router = express.Router();

//chỗ này để hiện thông tin trong cart của user, có nút THANH TOÁN
// prettier-ignore
router.get(
	'/',
	(req,res) => {
        res.render('index')
    }
);

router.post("/:id", testPaypal);
// router.post("", testPaypal);

//chỗ này để thực hiện các bước THANH TOÁN sau khi user bấm nút THANH TOÁN ở trên
// prettier-ignore
// router.post("/testt", purchasingController.purchase);
// router.post("/:userId", purchasingController.purchase);

// prettier-ignore
router.get(
    '/success',
    //authController.protect,
    getSuccess)

// prettier-ignore
router.get(
    '/cancel',
    //authController.protect,
    getCancel
)

module.exports = router;
