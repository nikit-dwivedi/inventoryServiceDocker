const http = require('http');
const app = require('./app');
require('dotenv').config();
const port = process.env.APPID||9000;
const server = http.createServer(app)
server.listen(port, () => {
    console.log(`server running on ${port}`);
})