const express = require('express');
const router = express.Router();

const outletRouter = require('./routes/outlet.route');
const menuRoute = require('./routes/menu.route.js');
const discountRoute = require('./routes/discount.route.js');
const searchRoute = require('./routes/search.route.js');
const bannerRoute = require('./routes/banner.route.js');
const deleteRoute = require('./routes/delete.route.js');
const imageRoute = require('./routes/image.route.js');


router.use('/outlet', outletRouter)
router.use('/menu', menuRoute);
router.use('/discount', discountRoute)
router.use('/search', searchRoute)
router.use('/banner', bannerRoute)
router.use('/delete', deleteRoute)
router.use('/image',imageRoute)

module.exports = router;