const router = require('express').Router();

const outletController = require('../controllers/outlet.controller');
const uploads = require('../helpers/multer.helper');
const { authenticateSeller, authenticateUser, authenticateGuest, authenticateAdmin } = require('../middleware/authToken');



//-----------------------------------------client--------------------------------------------//
router.post('/home', authenticateGuest, outletController.homeScreen);
router.get('/filtered',authenticateGuest,outletController.filteredOutlet)
router.get('/discount/:outletId', authenticateGuest, outletController.outletDiscount);
router.post('/cuisine', authenticateAdmin, outletController.newCuisine);
router.get('/cuisine', authenticateGuest, outletController.cuisineList);
router.get('/cuisine/:cuisineId', outletController.getOutletByCuisine);
router.post('/rate', outletController.rateOutlet);

//-----------------------------------------seller-------------------------------------------//
router.post('/', authenticateSeller, uploads.fields([{ name: 'outletImage', maxCount: 1 }, { name: 'outletBanner', maxCount: 1 }]), outletController.addNewOutlet);
router.post('/transaction', authenticateSeller, outletController.sellerTransaction);
router.get('/seller', authenticateSeller, outletController.getSellerOutlet);
router.get('/single/:outletId', outletController.getOutlet);
router.post('/update/:outletId', uploads.fields([{ name: 'outletImage', maxCount: 1 }, { name: 'outletBanner', maxCount: 1 }]), outletController.updateOutlet);
router.get('/status/:outletId', authenticateSeller, outletController.changeClosedStatus)
router.post('/discount', authenticateSeller, outletController.changeDiscount)
router.post('/discount/remove', authenticateSeller, outletController.removeDiscount);
router.post('/verify', authenticateAdmin, outletController.verifyOutlet);
router.post('/bank/add', authenticateSeller, outletController.addBankToOutlet);

//-----------------------------------------others------------------------------------------//
router.get('/all', outletController.getAllOutlet);
router.get('/all/paginated', outletController.getAllPaginatedOutlet);
router.post('/nearby', outletController.outletNearby)
router.post('/close', authenticateAdmin, outletController.closeAllOutlet)
router.get('/yeloOutlet', outletController.addYeloShop);
router.get('/stat', authenticateAdmin, outletController.getStat)
router.get('/full/search', outletController.addToSearch)
router.get('/full/search/result', outletController.getSearchData)



module.exports = router