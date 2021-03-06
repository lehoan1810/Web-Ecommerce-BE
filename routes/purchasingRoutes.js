const express = require('express');
const authController = require('../controllers/authController');
const { testPaypal, getSuccess, getCancel } = require('../controllers/Paypal');

const router = express.Router();

//chỗ này để hiện thông tin trong cart của user, có nút THANH TOÁN
// prettier-ignore
router.get(
	'/', (req, res) => res.render('index')
);

router.post('/:userId', testPaypal);

//chỗ này để thực hiện các bước THANH TOÁN sau khi user bấm nút THANH TOÁN ở trên
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
