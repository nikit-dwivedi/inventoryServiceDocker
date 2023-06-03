const router = require('express').Router();

const searchController = require('../controllers/search.controller.js');
const { authenticateSeller, authenticateUser } = require('../middleware/authToken');



//-----------------------------------------client--------------------------------------------//
router.get('/:search', searchController.overAllSearch);
//-----------------------------------------seller-------------------------------------------//


module.exports = router