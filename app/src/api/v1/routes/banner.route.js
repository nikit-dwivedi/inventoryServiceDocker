const express = require('express');
const router = express.Router();

const { allBanner, addNewBanner } = require('../controllers/banner.controller');

router.post('/', addNewBanner);
router.get('/', allBanner);

module.exports = router