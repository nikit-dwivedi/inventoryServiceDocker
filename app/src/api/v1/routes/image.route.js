const express = require('express');
const router = express.Router();

const {uploadImageApi  } = require('../controllers/image.controller.js');
const uploads = require('../helpers/multer.helper.js');

router.post('/',uploads.single("image"),uploadImageApi);

module.exports = router