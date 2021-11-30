const express = require("express");
const purchasingController = require("../controllers/purchasingController");
const authController = require("../controllers/authController");

const router = express.Router();

//chỗ này để hiện thông tin trong cart của user, có nút THANH TOÁN
// prettier-ignore
router.get(
	'/',
	(req,res) => {
        res.render('index')
    }
);

//chỗ này để thực hiện các bước THANH TOÁN sau khi user bấm nút THANH TOÁN ở trên
// prettier-ignore
router.post(
	'/id',
	authController.protect,
	purchasingController.purchase
);

// prettier-ignore
router.get(
    '/success',
    //authController.protect,
    purchasingController.getSuccess)

// prettier-ignore
router.get(
    '/cancel',
    //authController.protect,
    purchasingController.getCancel
)

module.exports = router;
