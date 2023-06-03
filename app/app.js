const express = require('express');
const cors = require('cors');
const compression = require('compression')
const app = express();
const morgan = require('morgan');
require("./src/api/v1/config/mongodb");
const version1Index = require('./src/api/v1/index');
const { badRequest } = require('./src/api/v1/helpers/response.helper');

//----------use dependencies----------------------------------
//use morgan
app.use(morgan('dev'));
// use cors
app.use(cors());
//image path
app.use('/static', express.static('static'))
//body parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//compression
app.use(compression())

//----------redirect routes-----------------------------------
app.use('/v1', version1Index);


//----------for invalid requests start -----------------------


app.all('*', async (req, res) => {
    await badRequest(res, 'Invalid URI');
});

module.exports = app;