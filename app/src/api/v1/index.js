const express = require('express');
const router = express.Router();

const outletRouter = require('./routes/outlet.route');
const menuRoute = require('./routes/menu.route.js');
const discountRoute = require('./routes/discount.route.js');
const searchRoute = require('./routes/search.route.js');
const bannerRoute = require('./routes/banner.route.js');
const deleteRoute = require('./routes/delete.route.js');
const imageRoute = require('./routes/image.route.js');
const productModel = require('./models/product.model');
const categoryModel = require('./models/category.model');
const outletModel = require('./models/outlet.model');

router.use('/outlet', outletRouter)
router.use('/menu', menuRoute);
router.use('/discount', discountRoute)
router.use('/search', searchRoute)
router.use('/banner', bannerRoute)
router.use('/delete', deleteRoute)
router.use('/image',imageRoute)

// router.get('/update-outlet', async (req, res) => {
//     try {
//         let a = [
//             {
//                 "_id": {
//                     "$oid": "63fece50883e6b0b7dbb6bfa"
//                 },
//                 "userId": {
//                     "$oid": "637470a5ed01942c0d3d41bc"
//                 },
//                 "orderId": "order_LM7YRvIRSOLW2D",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677643344066",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "63fee328883e6b0b7dbb6d7e"
//                 },
//                 "userId": {
//                     "$oid": "63f06e0d4b2192495b6c9d86"
//                 },
//                 "orderId": "ByAdmin353881",
//                 "amount": 10000,
//                 "interest": "36",
//                 "dateOfInvest": "1677648680948",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "63ff1cd7883e6b0b7dbb7170"
//                 },
//                 "userId": {
//                     "$oid": "63fdcd9e77fc8ed54847d2ed"
//                 },
//                 "orderId": "order_LMDGQvfuVhwqvl",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677663447204",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "63ff3ae5883e6b0b7dbb7405"
//                 },
//                 "userId": {
//                     "$oid": "63a68d398efb22aef2d7128a"
//                 },
//                 "orderId": "order_LMFQdjWV6qu3MW",
//                 "amount": 50000,
//                 "interest": "37",
//                 "dateOfInvest": "1677671141860",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "63ff3d2e883e6b0b7dbb744f"
//                 },
//                 "userId": {
//                     "$oid": "635aac33dc35f81232a28d1e"
//                 },
//                 "orderId": "order_LMFcAfSTvCsLqd",
//                 "amount": 10000,
//                 "interest": "37",
//                 "dateOfInvest": "1677671726273",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "64006151df04de8087e52ee0"
//                 },
//                 "userId": {
//                     "$oid": "63fdcd9e77fc8ed54847d2ed"
//                 },
//                 "orderId": "order_LMaqr2EZLmkbwo",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677746513842",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6400688429f14dd0d8904301"
//                 },
//                 "userId": {
//                     "$oid": "640060eadf04de8087e52eba"
//                 },
//                 "orderId": "order_LMbLy039a6kn4M",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677748356178",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640073c029f14dd0d89043e4"
//                 },
//                 "userId": {
//                     "$oid": "63f45eac930ba04b8d887d10"
//                 },
//                 "orderId": "order_LMcBxsp8lBHx0M",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677751232390",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6400b63c9800f732a02facc6"
//                 },
//                 "userId": {
//                     "$oid": "6400a4bb29f14dd0d890472e"
//                 },
//                 "orderId": "order_LMh1G4nUhGTCnc",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677768252029",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "64017350aa426d76818addd3"
//                 },
//                 "userId": {
//                     "$oid": "639da84f031ce80367a2298e"
//                 },
//                 "orderId": "order_LMujk6sfXRbbNe",
//                 "amount": 40000,
//                 "interest": "36",
//                 "dateOfInvest": "1677816656659",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640182d4aa426d76818adee5"
//                 },
//                 "userId": {
//                     "$oid": "63ff055e883e6b0b7dbb701f"
//                 },
//                 "orderId": "order_LMvreAF9xWkDeO",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677820628368",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6401be7caa426d76818ae219"
//                 },
//                 "userId": {
//                     "$oid": "6385c33b05107fe2d63edee7"
//                 },
//                 "orderId": "ByAdmin915641",
//                 "amount": 150000,
//                 "interest": "42",
//                 "dateOfInvest": "1677835900186",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6402f2233159cb896c71dc10"
//                 },
//                 "userId": {
//                     "$oid": "63fe29d0883e6b0b7dbb6825"
//                 },
//                 "orderId": "order_LNMaeqrxXgg1S2",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677914659697",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640302953159cb896c71dcf5"
//                 },
//                 "userId": {
//                     "$oid": "63d4d12e4d01f1d300717f34"
//                 },
//                 "orderId": "order_LNNnBCtmfNVzOs",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1677918869239",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "64030e253159cb896c71dd88"
//                 },
//                 "userId": {
//                     "$oid": "640219d3aa426d76818ae559"
//                 },
//                 "orderId": "order_LNOd1GCyrpul9G",
//                 "amount": 20000,
//                 "interest": "42",
//                 "dateOfInvest": "1677921829623",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640317913159cb896c71dddb"
//                 },
//                 "userId": {
//                     "$oid": "640219d3aa426d76818ae559"
//                 },
//                 "orderId": "ByAdmin448096",
//                 "amount": 500000,
//                 "interest": "42",
//                 "dateOfInvest": "1677924241913",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640337103159cb896c71ded0"
//                 },
//                 "userId": {
//                     "$oid": "63d1145b4d01f1d3007171d8"
//                 },
//                 "orderId": "ByAdmin447617",
//                 "amount": 75000,
//                 "interest": "36",
//                 "dateOfInvest": "1677932304721",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "64048ce33159cb896c71e4eb"
//                 },
//                 "userId": {
//                     "$oid": "63e0bb75dbf3190e1d9a6a6c"
//                 },
//                 "orderId": "order_LNqRd2RUN4YDUz",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678019811019",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6404cc5a3159cb896c71e6a0"
//                 },
//                 "userId": {
//                     "$oid": "6404c4f93159cb896c71e620"
//                 },
//                 "orderId": "order_LNv35sLJ4Hm35c",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678036058318",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6405b8dc3159cb896c71ebd3"
//                 },
//                 "userId": {
//                     "$oid": "6405b83b3159cb896c71eb87"
//                 },
//                 "orderId": "order_LOCGOEwr8vm30t",
//                 "amount": 10,
//                 "interest": "36",
//                 "dateOfInvest": "1678096604730",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6405d5e13159cb896c71edc2"
//                 },
//                 "userId": {
//                     "$oid": "6385c33b05107fe2d63edee7"
//                 },
//                 "orderId": "ByAdmin409369",
//                 "amount": 150000,
//                 "interest": "42",
//                 "dateOfInvest": "1678104033737",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6405e0083159cb896c71ee01"
//                 },
//                 "userId": {
//                     "$oid": "6371d5b5ed01942c0d3d338e"
//                 },
//                 "orderId": "ByAdmin785285",
//                 "amount": 25000,
//                 "interest": "37",
//                 "dateOfInvest": "1678106632986",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6406cdc801499baba4030c57"
//                 },
//                 "userId": {
//                     "$oid": "6371d5b5ed01942c0d3d338e"
//                 },
//                 "orderId": "ByAdmin582509",
//                 "amount": 25000,
//                 "interest": "37",
//                 "dateOfInvest": "1678167496486",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6406d75a01499baba4030cb4"
//                 },
//                 "userId": {
//                     "$oid": "64034b023159cb896c71dfd5"
//                 },
//                 "orderId": "order_LOX5NA7RxfwZUF",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678169946183",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6406e18c01499baba4030d87"
//                 },
//                 "userId": {
//                     "$oid": "63fdc7e877fc8ed54847d1b8"
//                 },
//                 "orderId": "order_LOXpMgZ1X1bX1I",
//                 "amount": 15000,
//                 "interest": "37",
//                 "dateOfInvest": "1678172556332",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6406e6fc01499baba4030ddd"
//                 },
//                 "userId": {
//                     "$oid": "63fdc7e877fc8ed54847d1b8"
//                 },
//                 "orderId": "order_LOYCg6JdcdkKHa",
//                 "amount": 35000,
//                 "interest": "37",
//                 "dateOfInvest": "1678173948062",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6406e98d01499baba4030dfd"
//                 },
//                 "userId": {
//                     "$oid": "6385c33b05107fe2d63edee7"
//                 },
//                 "orderId": "ByAdmin837433",
//                 "amount": 210000,
//                 "interest": "42",
//                 "dateOfInvest": "1678174605958",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "64097dfa4c10bb47baae36a4"
//                 },
//                 "userId": {
//                     "$oid": "63a68d398efb22aef2d7128a"
//                 },
//                 "orderId": "order_LPKNCcCkXv2wXA",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678343674844",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "6409f2664c10bb47baae3a58"
//                 },
//                 "userId": {
//                     "$oid": "63fdcd9e77fc8ed54847d2ed"
//                 },
//                 "orderId": "order_LPSsE88m4rtpeZ",
//                 "amount": 15000,
//                 "interest": "36",
//                 "dateOfInvest": "1678373478582",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640a07dd4c10bb47baae3ade"
//                 },
//                 "userId": {
//                     "$oid": "636e35eb97f403a6b57bcbf9"
//                 },
//                 "orderId": "order_LPURqOFibjXgS4",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678378973037",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640abcd74c10bb47baae3ce2"
//                 },
//                 "userId": {
//                     "$oid": "63aaa99999db4ec701a599ef"
//                 },
//                 "orderId": "order_LPhYn6VzTK0o1X",
//                 "amount": 10000,
//                 "interest": "36",
//                 "dateOfInvest": "1678425303339",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640ac0584c10bb47baae3d52"
//                 },
//                 "userId": {
//                     "$oid": "63aaa99999db4ec701a599ef"
//                 },
//                 "orderId": "order_LPhqBjwzygiu5J",
//                 "amount": 10000,
//                 "interest": "36",
//                 "dateOfInvest": "1678426200808",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640ad1c14c10bb47baae3df4"
//                 },
//                 "userId": {
//                     "$oid": "63c681bc5e7258c15342c1ee"
//                 },
//                 "orderId": "order_LPj7cJawSdLnpm",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678430657588",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640ae5944c10bb47baae3ee1"
//                 },
//                 "userId": {
//                     "$oid": "638eff19f68b32b8554c53ef"
//                 },
//                 "orderId": "order_LPkY8n2l61IeQP",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678435732331",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640b41644c10bb47baae41e9"
//                 },
//                 "userId": {
//                     "$oid": "640b3dfc4c10bb47baae4131"
//                 },
//                 "orderId": "order_LPrETxow5pyxcI",
//                 "amount": 10000,
//                 "interest": "36",
//                 "dateOfInvest": "1678459236599",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640daa004c10bb47baae4c53"
//                 },
//                 "userId": {
//                     "$oid": "636e35dc97f403a6b57bcbf3"
//                 },
//                 "orderId": "order_LQa2s7hotC9ywW",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678617088631",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640ec6bb4c10bb47baae511a"
//                 },
//                 "userId": {
//                     "$oid": "63f06e0d4b2192495b6c9d86"
//                 },
//                 "orderId": "ByAdmin363671",
//                 "amount": 10000,
//                 "interest": "36",
//                 "dateOfInvest": "1678689979985",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "640f15cb4c10bb47baae5411"
//                 },
//                 "userId": {
//                     "$oid": "63721d33ed01942c0d3d38f4"
//                 },
//                 "orderId": "order_LR0V7lvcYBD13i",
//                 "amount": 10000,
//                 "interest": "36",
//                 "dateOfInvest": "1678710219419",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "64102a90b62f7982b81fbd94"
//                 },
//                 "userId": {
//                     "$oid": "63a68d398efb22aef2d7128a"
//                 },
//                 "orderId": "order_LRKaRmw8BoJx2W",
//                 "amount": 5000,
//                 "interest": "36",
//                 "dateOfInvest": "1678781072858",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "641050d7c54b4523ac5a35bb"
//                 },
//                 "userId": {
//                     "$oid": "63fdcd9e77fc8ed54847d2ed"
//                 },
//                 "orderId": "order_LRNPCwzyfhYs7Q",
//                 "amount": 10000,
//                 "interest": "36",
//                 "dateOfInvest": "1678790871057",
//                 "lockingPeriod": "6",
//                 "status": 1
//             },
//             {
//                 "_id": {
//                     "$oid": "64105651c54b4523ac5a365c"
//                 },
//                 "userId": {
//                     "$oid": "63d4d12e4d01f1d300717f34"
//                 },
//                 "orderId": "order_LRNntrJo7nMJqm",
//                 "amount": 11000,
//                 "interest": "36",
//                 "dateOfInvest": "1678792273090",
//                 "lockingPeriod": "6",
//                 "status": 1
//             }
//         ]

//         let b = a.map((data) => {
//             let date = new Date(data.dateOfInvest * 1).toDateString()
//             data._id = data._id.$oid
//             data.userId = data.userId.$oid
//             data.dateOfInvest = date
//             return data
//             console.log(data);
//         })
//         res.send(b)
//     } catch (error) {
//         console.log(error);
//         res.send("ops")
//     }
// })

module.exports = router;