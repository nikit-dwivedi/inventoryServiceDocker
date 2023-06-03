const router = require('express').Router();

const outletController = require('../controllers/outlet.controller');
const uploads = require('../helpers/multer.helper');
const { authenticateSeller, authenticateUser, authenticateGuest, authenticateAdmin } = require('../middleware/authToken');



//-----------------------------------------client--------------------------------------------//
router.post('/home', authenticateGuest, outletController.homeScreen);
router.get('/discount/:outletId', authenticateGuest, outletController.outletDiscount);
router.post('/cuisine', authenticateAdmin, outletController.newCuisine);
router.get('/cuisine', authenticateGuest, outletController.cuisineList);
router.get('/cuisine/:cuisineId', outletController.getOutletByCuisine);
router.post('/rate', outletController.rateOutlet);

//-----------------------------------------seller-------------------------------------------//
router.post('/', authenticateSeller, uploads.single('outletImage'), outletController.addNewOutlet);
router.get('/seller', authenticateSeller, outletController.getSellerOutlet);
router.get('/single/:outletId', outletController.getOutlet);
router.post('/update/:outletId', uploads.single('outletImage'),outletController.updateOutlet);
router.get('/status/:outletId', authenticateSeller, outletController.changeClosedStatus)
router.post('/discount', authenticateSeller, outletController.changeDiscount)
router.post('/discount/remove', authenticateSeller, outletController.removeDiscount);
router.post('/verify',authenticateAdmin,outletController.verifyOutlet);

//-----------------------------------------others------------------------------------------//
router.get('/all', outletController.getAllOutlet);
router.post('/nearby', outletController.outletNearby)
router.post('/close', authenticateAdmin, outletController.closeAllOutlet)
router.get('/yeloOutlet', outletController.addYeloShop);
router.get('/stat', authenticateAdmin, outletController.getStat)


module.exports = router