const router = require('express').Router();

const discountController = require('../controllers/discount.controller');
const { authenticateSeller, authenticateUser } = require('../middleware/authToken');

router.post('/', authenticateSeller, discountController.createDiscount)
router.get('/', authenticateSeller, discountController.getSellerDiscount)
router.get('/:discountId', discountController.getDiscountById)
router.get('/outlet/:discountId', discountController.getOutletByDiscountId)
module.exports = router