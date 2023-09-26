const express = require('express');
const router = express.Router();

const menuController = require('../controllers/menu.controller.js');
const uploads = require('../helpers/multer.helper.js');



router.get('/:outletId', menuController.getMenu);
router.get('/full/:outletId', menuController.getFullMenu);

//--------------------------------------category---------------------------------------------//
router.post('/category', menuController.addNewCategory);
router.get('/category/:outletId', menuController.getCategory)
router.get('/sub-category/:parentCategoryId', menuController.getSubCategory)
router.get('/category/full/:parentCategoryId', menuController.getAllItemOfCategory)
router.post('/category/edit', menuController.editCategory)

//---------------------------------------product--------------------------------------------//
router.post('/product', uploads.single('productImage'), menuController.addNewProduct);
router.post('/product/edit/:productId', uploads.single('productImage'), menuController.editProduct);
router.post('/stock', menuController.outOfStockProduct);
router.post('/product/addOn', menuController.linkUnlinkAddOn);
router.get('/product/addOn/:productId', menuController.getProductAddon);
router.get('/stock/:productId', menuController.stockChange);
router.get('/prod/:parentCategoryId', menuController.getProductByCategory)
router.get('/product/:productId', menuController.getProduct)
router.get('/product/search/add', menuController.addToSearch)
router.get('/product/search/result', menuController.getSearchData)

//------------------------------------customization----------------------------------------//
router.post('/customization', menuController.addCustomization)
router.get('/customization/:productId', menuController.getCustomization)
router.post('/customization/reverse', menuController.getCustomizationReverse)
router.get('/customization/single/:customizationId', menuController.getCustomizationDetail)
router.post('/customization/edit/:variationId', menuController.editCustomization)

//-------------------------------------custom-item-----------------------------------------//
router.post('/customitem', menuController.addCustomItem)
router.post('/customitem/edit/', menuController.editCustomItem)
router.get('/customitem/:variantId', menuController.getCustomItemByItemId)


//---------------------------------------==addon-----------------------------------------//
router.get('/addOn/:outletId', menuController.getOutletAddon)
router.post('/addOn/category', menuController.addNewAddOnCategory)
router.post('/addOn/category/edit', menuController.editAddOnCategoryDetails)
router.get('/addOn/category/:addOnCategoryId', menuController.getAddonList)
router.post('/addOn/product', menuController.addNewAddOnProduct)
router.post('/addOn/product/edit', menuController.editAddOnProductDetails)

//------------------------------------cart-data-----------------------------------------//
router.post('/custom-item/:productId', menuController.getCustomItem)



module.exports = router;