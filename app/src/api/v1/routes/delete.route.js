const express = require('express');
const router = express.Router();

const {deleteData  } = require('../controllers/delete.controller.js');

router.post('/',deleteData);

module.exports = router