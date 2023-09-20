const outletModel = require('../models/outlet.model');
const { outletFormmater, responseFormater, updatedOutletFormatter } = require('./format.helper');
const { get } = require('../services/axios.service');
const { orderCountUrl } = require('../services/url.service');
const { discountByDiscountId } = require('./discount.helper');
const { checkBankByBankId, getAllTransactionOfOutlet } = require('../services/payment.service');

exports.addOutlet = async (sellerId, bodyData, cuisineList) => {
    try {
        const outletFormat = outletFormmater(sellerId, bodyData, cuisineList);
        const saveData = new outletModel(outletFormat);
        await saveData.save()
        return responseFormater(true, "outlet added succesfully", {})
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.outletByOutletId = async (outletId) => {
    try {
        const outletData = await outletModel.findOne({ outletId, isActive: true }).select('-_id -openingHours._id -isActive -__v');
        return outletData ? responseFormater(true, "outlet info", outletData) : responseFormater(false, "outlet not found", {})
    } catch (error) {
        return responseFormater(false, "bad requres", error)
    }
}
exports.markOutletVerify = async (outletId, status) => {
    try {
        await outletModel.findOneAndUpdate({ outletId, isActive: true }, { isVisible: status, isVerified: status })
        return responseFormater(true, "outlet verification status changed")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.linkBank = async (outletId, bankId, token) => {
    try {
        const outletCheck = await outletModel.exists({ outletId })
        if (!outletCheck) {
            return responseFormater(false, "outlet not found")
        }
        const bankCheck = await checkBankByBankId(bankId, token)
        if (!bankCheck.status) {
            return responseFormater(false, bankCheck.message)
        }
        await outletModel.findOneAndUpdate({ outletId }, { bankId })
        return responseFormater(true, "Bank Linked")
    } catch (error) {
        return responseFormater(false, error.message, error)

    }
}
exports.transactionOfOutlets = async (outletList, token, from, to, outletMap) => {
    try {
        const { status, message, data } = await getAllTransactionOfOutlet(outletList, from, to, token)
        if (!status) {
            return responseFormater(false, message)
        }
        const formattedData = data.map((data) => {
            const additionData = outletMap.get(data.outletId)
            data = { outletName: additionData.outletName, area: additionData.area, ...data }
            return data
        })
        return responseFormater(true, message, formattedData)
    } catch (error) {
        return responseFormater(false, error.message, error)
    }
}

exports.outletByCuisineId = async (cuisineId) => {
    try {
        const outletData = await outletModel.find({ 'cuisines.cuisineId': cuisineId, isActive: true, isVisible: true, isVerified: true, isClosed: false }).select('-_id -openingHours._id -isActive -__v');
        return outletData[0] ? responseFormater(true, "outlet list", outletData) : responseFormater(false, "outlet not found", [])
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.outletsBySellerId = async (sellerId, mode) => {
    try {
        if (mode === '2') {
            mode = undefined
        }
        else if (mode === '0') {
            mode = true
        }
        else if (mode === '1') {
            mode = false
        } else {
            return responseFormater(false, "invalid mode", {})
        }
        let query = (mode != undefined) ? { sellerId, isActive: true, isClosed: mode } : { sellerId, isActive: true }
        // const outletList = await outletModel.find(query).select('-_id outletId outletName area phone outletImage outletBanner isClosed shopAddress isVerified longitude latitude isDiscounted discountId').lean();
        const outletList = await outletModel.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: "discounts",
                    localField: "discountId",
                    foreignField: "discountId",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            discountId: 1,
                            customId: 1,
                            discountTitle: 1,
                            promoCode: 1,
                            discountPercent: 1,
                            maxDiscount: 1,
                            minAmount: 1,
                            isFlatDiscount: 1,
                            isCustom: 1,
                        }
                    }],
                    as: "discountObj"
                }
            },
            {
                $lookup: {
                    from: "discounts",
                    localField: "discountId",
                    foreignField: "discountId",
                    pipeline: [{
                        $project: {
                            _id: 0,
                            discountId: 1,
                            customId: 1,
                            discountTitle: 1,
                            promoCode: 1,
                            discountPercent: 1,
                            maxDiscount: 1,
                            minAmount: 1,
                            isFlatDiscount: 1,
                            isCustom: 1,
                        }
                    }],
                    as: "discountObj"
                }
            },
            {
                $set: {
                    discountData: {
                        $cond: {
                            if: { $ne: ["$discountId", ""] },
                            then: { $first: "$discountObj" },
                            else: {
                                discountId: "",
                                customId: "",
                                discountTitle: "",
                                promoCode: "",
                                discountPercent: 0,
                                maxDiscount: 0,
                                minAmount: 0,
                                isFlatDiscount: false,
                                isCustom: false
                            }
                        }
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    outletId: 1,
                    outletName: 1,
                    area: 1,
                    phone: 1,
                    outletImage: 1,
                    outletBanner: 1,
                    isClosed: 1,
                    shopAddress: 1,
                    isVerified: 1,
                    longitude: 1,
                    latitude: 1,
                    isDiscounted: 1,
                    discountId: 1,
                    discountData: 1,
                }
            }
        ])
        if (outletList[0]) {
            const promises = outletList.map(async (element) => {
                element.pendingCount = 0;
                element.preparingCount = 0;
                element.readyCount = 0;
                element.dispatchedCount = 0;
                element.deliveredCount = 0;
                element.cancelledCount = 0;

                const count = await this.getOrderCount(element.outletId);
                if (count) {
                    element.pendingCount = count.pendingCount;
                    element.preparingCount = count.preperingCount;
                    element.readyCount = count.readyCount;
                    element.dispatchedCount = count.dispatchedCount;
                    element.deliveredCount = count.deliveredCount;
                    element.cancelledCount = count.cancelledCount;
                }
            });

            await Promise.all(promises);
        }
        return outletList[0] ? responseFormater(true, "outlet list", outletList) : responseFormater(false, "outlet not found", [])
    } catch (error) {
        console.log(error.message);
        return responseFormater(false, "bad request", error)
    }
}
exports.outletIdBySellerId = async (sellerId) => {
    try {
        const outletList = await outletModel.find({ sellerId, isActive: true, }).select('-_id outletId outletName area').lean();
        const idList = outletList.map(outlet => outlet.outletId)
        let idWithDetail
        if (idList[0]) {
            idWithDetail = new Map(outletList.map(outlet => [outlet.outletId, outlet]))
        }
        return idList[0] ? responseFormater(true, "outlet list", { idList, idWithDetail }) : responseFormater(false, "outlet not found", [])
    } catch (error) {
        return responseFormater(false, "bad request", error)
    }
}
exports.markOutletClosedOrOpen = async (sellerId, outletId, adminCheck) => {
    try {
        const query = adminCheck ? { outletId, isActive: true } : { sellerId, outletId, isActive: true }
        const outletData = await outletModel.findOne(query).select('-longitude -latitude -openingHours._id -isActive -__v');
        if (outletData) {
            await outletModel.findOneAndUpdate({ outletId }, { isClosed: !outletData.isClosed })
        }
        return outletData ? responseFormater(true, "status changed", {}) : responseFormater(false, "outlet not found", {})
    } catch (error) {
        throw (error)
        // return  (error.message)
        // return responseFormater(false, "bad requres", error)
    }
}
exports.outletStat = async () => {
    try {
        let statData = [
            // {
            //     type: "closed",
            //     count: 0
            // },
            // {
            //     type: "open",
            //     count: 0
            // },
            // {
            //     type: "visible",
            //     count: 0
            // },
            // {
            //     type: "issue",
            //     count: 0
            // },
        ]
        const visibleOutletData = await outletModel.aggregate([
            {
                $match: {
                    isActive: true,
                    isVisible: true
                }
            },
            {
                $group: {
                    _id: "$isClosed",
                    count: { $sum: 1 }
                }
            }
        ]);
        const verifiedOutletData = await outletModel.aggregate([
            {
                $match: {
                    isActive: true,
                }
            },
            {
                $group: {
                    _id: "$isVisible",
                    count: { $sum: 1 }
                }
            }
        ]);
        const visibleOutletDataMap = new Map(visibleOutletData.map(outlet => [outlet._id, outlet.count]))
        const verifiedOutletDataMap = new Map(verifiedOutletData.map(outlet => [outlet._id, outlet.count]))
        statData = visibleOutletDataMap.has(true) ? [{ type: "closed", count: visibleOutletDataMap.get(true) }, ...statData] : [{ type: "closed", count: 0 }, ...statData]
        statData = visibleOutletDataMap.has(false) ? [{ type: "open", count: visibleOutletDataMap.get(false) }, ...statData] : [{ type: "open", count: 0 }, ...statData]
        statData = verifiedOutletDataMap.has(true) ? [{ type: "visible", count: verifiedOutletDataMap.get(true) }, ...statData] : [{ type: "visible", count: 0 }, ...statData]
        statData = verifiedOutletDataMap.has(false) ? [{ type: "not visible", count: verifiedOutletDataMap.get(false) }, ...statData] : [{ type: "not visible", count: 0 }, ...statData]
        return responseFormater(true, "outlet stat", statData)
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.getFeaturedOutlet = async () => {
    try {
        const outletList = await outletModel.find({ isFeatured: true, isActive: true, isVisible: true, isVerified: true }).select('-_id -location -openingHours._id -isActive -__v');
        return outletList[0] ? responseFormater(true, "featured outlet list", outletList) : responseFormater(false, "no outlet found", outletList);
    } catch (error) {
        return responseFormater(false, "bad request", error);
    }
}
exports.allOutlet = async () => {
    try {

        const outletList = await outletModel.find({ isActive: true }).select('-_id -location  -openingHours._id -isActive -__v').lean()
        return outletList[0] ? responseFormater(true, "outlet list", outletList) : responseFormater(false, "outlet not found", [])
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }
}
exports.allOutletPaginated = async (page, limit) => {
    try {
        page = page ?? 1
        limit = limit ?? 10
        const options = {
            page: page,
            limit: limit,
            sort: { createdAt: -1 },
            select: '-_id -location  -openingHours._id -isActive -__v'
        };
        const outletList = await outletModel.paginate({ isActive: true }, options);
        return outletList ? responseFormater(true, "outlet list", outletList) : responseFormater(false, "outlet not found", [])
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }
}

exports.changeAllOutletStatus = async () => {
    try {
        await outletModel.updateMany({ isClosed: false }, { $set: { isClosed: true } })
        return responseFormater(true, "outlet list")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.getOrderCount = async (outletId) => {
    try {
        let countUrl = orderCountUrl(outletId)
        let count = await get(countUrl)
        console.log(outletId);
        return count ? count.items : false;
    } catch (error) {
        return false;
    }
}
exports.nearByOutlet = async (longitude, latitude) => {
    try {
        const nearByOutletList = await outletModel.aggregate(
            [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [longitude, latitude]
                        },
                        "distanceField": "none",
                        "spherical": true,
                        "maxDistance": 4500,
                        "query": { isActive: true, isFeatured: false, isVisible: true, isVerified: true, isClosed: false },

                    },
                }, {
                    "$project": {
                        "_id": 0,
                        "location": 0,
                        "isActive": 0,
                        "openingHours._id": 0,
                        "none": 0,
                        "__v": 0
                    }
                }, {
                    $limit: 10
                }
            ])
        return nearByOutletList[0] ? responseFormater(true, "list of nearby outlet", nearByOutletList) : responseFormater(false, "no outlet nearby", [])
    } catch (error) {
        console.log(error);
        return responseFormater(false, "bad request", [])
    }
}
exports.featuredOutlet = async (longitude, latitude) => {
    try {
        const featuredOutletList = await outletModel.aggregate(
            [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [longitude, latitude]
                        },
                        "distanceField": "none",
                        "spherical": true,
                        "maxDistance": 4500,
                        "query": { isActive: true, isFeatured: true, isVisible: true, isVerified: true, isClosed: false },

                    },
                }, {
                    "$project": {
                        "_id": 0,
                        "location": 0,
                        "isActive": 0,
                        "openingHours._id": 0,
                        "none": 0,
                        "__v": 0
                    }
                }, {
                    $limit: 10
                }
            ])
        return featuredOutletList[0] ? responseFormater(true, "list of nearby outlet", featuredOutletList) : responseFormater(false, "no outlet nearby", [])
    } catch (error) {
        console.log(error);
        return responseFormater(false, "bad request", [])
    }
}
exports.allNearByOutlet = async (longitude, latitude) => {
    try {
        const allNearByOutletList = await outletModel.aggregate(
            [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [longitude, latitude]
                        },
                        "distanceField": "none",
                        "spherical": true,
                        "maxDistance": 4500,
                        "query": { isActive: true, isFeatured: false, isVisible: true, isVerified: true, isClosed: false },

                    },
                }, {
                    "$project": {
                        "_id": 0,
                        "location": 0,
                        "isActive": 0,
                        "openingHours._id": 0,
                        "none": 0,
                        "__v": 0
                    }
                }, {
                    $skip: 10
                },
            ])
        return allNearByOutletList[0] ? responseFormater(true, "list of nearby outlet", allNearByOutletList) : responseFormater(false, "no outlet nearby", [])
    } catch (error) {
        console.log(error);
        return responseFormater(false, "bad request", [])
    }
}
exports.homeScreenFormanter = async (clientLong, clientLat) => {
    let { status: nearByStatus, message: nearByMessage, data: nearByData } = await this.nearByOutlet(clientLong, clientLat);
    let { status: featuredStatus, message: featuredMessage, data: featuredData } = await this.featuredOutlet(clientLong, clientLat);
    let { status: allOutletStatus, message: allOutletMessage, data: allOutletData } = await this.allNearByOutlet(clientLong, clientLat);
    return { nearByData, featuredData, allOutletData }
}
exports.cartInit = async (userId) => {
    const response = await get(`http://139.59.60.119:4101/v1/cart/${userId}`)
    console.log(response);
}
exports.addDiscountToOutlet = async (outletId, discountId) => {
    try {
        const outletCheck = await outletModel.exists({ outletId })
        if (!outletCheck) {
            return responseFormater(false, "outlet not found")
        }
        const discountCheck = await discountByDiscountId(discountId)
        if (!discountCheck.status) {
            return responseFormater(false, "invalid discount id")
        }
        let isDiscounted = true
        let { discountPercent, isFlatDiscount, maxDiscount = "na", minAmount = "0" } = discountCheck.data
        let discountDetails = { discountPercent, isFlatDiscount, maxDiscount, minAmount }
        await outletModel.findOneAndUpdate({ outletId }, { discountId, discountDetails, isDiscounted })
        return responseFormater(true, "discount updated")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.removeDiscountToOutlet = async (outletId) => {
    try {
        const outletCheck = await outletModel.exists({ outletId })
        if (!outletCheck) {
            return responseFormater(false, "outlet not found")
        }
        let isDiscounted = false
        let discountId = ""
        let discountDetails = {
            discountPercent: "",
            isFlatDiscount: false
        }
        await outletModel.findOneAndUpdate({ outletId }, { discountId, discountDetails, isDiscounted })
        return responseFormater(true, "discount removed")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.editOutletDetails = async (outletId, updateData, cuisineList) => {
    try {
        const outletCheck = await outletModel.exists({ outletId })
        if (!outletCheck) {
            return responseFormater(false, "outlet not found")
        }
        const formateUpdatedOutlet = updatedOutletFormatter(updateData, cuisineList)
        await outletModel.findOneAndUpdate({ outletId }, formateUpdatedOutlet, { new: true })
        return responseFormater(true, "outlet updated")
    } catch (error) {
        console.log(error);
        return responseFormater(false, error.message)
    }
}
exports.outletSearch = async (searchText, long, lat) => {
    try {
        const longitude = Number(long ?? 75.906893)
        const latitude = Number(lat ?? 22.757074)
        const nearByActiveOutletList = await outletModel.aggregate(
            [
                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [longitude, latitude]
                        },
                        "distanceField": "distance",
                        "spherical": true,
                        "distanceMultiplier": 0.001,
                        "maxDistance": 4500,
                        "query": { isActive: true, isClosed: false, isVisible: true, isVerified: true },

                    },
                }, {
                    "$project": {
                        "_id": 0,
                        "outletId": 1,
                        "outletName": 1,
                        "outletImage": 1,
                        "area": 1,
                        "isClosed": 1,
                        "preparationTime": 1,
                        "cuisines": 1,
                        "rating": 1,
                        "isPureVeg": 1,
                        "isDiscounted": 1,
                        "discountId": 1,
                        "discountDetails": 1,
                        "distance": { "$round": ["$distance", 2] },
                    }
                },
                {
                    "$group": {
                        "_id": "$outletId",
                        "data": { "$first": "$$ROOT" }
                    }
                }
            ])
        nearByActiveOutletList.map((product) => {
            product.data.serving = false
            if (product.data.distance < 4.5) {
                product.data.serving = true
            }
            return product
        })
        const searchResult = await outletModel.aggregate(
            [

                {
                    "$geoNear": {
                        "near": {
                            "type": "Point",
                            "coordinates": [longitude, latitude]
                        },
                        "distanceField": "distance",
                        "spherical": true,
                        "distanceMultiplier": 0.001,
                        // "maxDistance": 4500,
                        "query": { isActive: true, isVerified: true, isVisible: true, isClosed: false },
                    },
                },
                {
                    "$addFields": {
                        "outletNameWithoutSpaces":
                        {
                            "$reduce": {
                                "input": { "$split": ["$outletName", " "] },
                                "initialValue": "",
                                "in": {
                                    "$concat": [
                                        "$$value",
                                        { "$cond": [{ "$eq": ["$$value", ""] }, "", ""] },
                                        "$$this"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        outletNameWithoutSpaces: { $regex: searchText.replace(/\s+/g, ''), $options: 'i' }
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "outletId": 1,
                        "outletName": 1,
                        "outletImage": 1,
                        "area": 1,
                        "isClosed": 1,
                        "preparationTime": 1,
                        "cuisines": 1,
                        "rating": 1,
                        "isPureVeg": 1,
                        "isDiscounted": 1,
                        "discountId": 1,
                        "discountDetails": 1,
                        "distance": { "$round": ["$distance", 2] },
                    }
                }
            ])
        searchResult.map((product) => {
            product.serving = false
            if (product.distance < 4.5) {
                product.serving = true
            }
            product.type = 'outlet'
            return product
        })
        return { searchResult, nearByActiveOutletList }
    } catch (error) {
        console.log(error);
        return false
    }
}
exports.outletByDiscountId = async (discountId) => {
    try {
        const discountData = await outletModel.find({ discountId, isVisible: true, isVerified: true }).select('-_id -location  -openingHours._id -isActive -__v')
        return discountData[0] ? responseFormater(true, "outlet list", discountData) : responseFormater(false, "no outlet found")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}
exports.outletCheck = async (outletId) => {
    try {
        const outletData = await outletModel.exists({ outletId })
        return outletData ? responseFormater(true, "outlet Id", outletData) : responseFormater(false, "outlet not found")
    } catch (error) {
        return responseFormater(false, error.message)
    }
}

exports.openCloseOutlets = async () => {
    try {
        // Assuming you have a collection called 'outlets'
        // and the current day and time are available as JavaScript Date objects

        const currentDay = new Date().getDay(); // Get the current day of the week (0-6, where 0 is Sunday)
        const currentTime = "09:00:00"
        // new Date().toLocaleTimeString('en-US', { hour12: false }); // Get the current time in 24-hour format
        console.log(currentTime);
        let data = outletModel.aggregate([
            {
                $project: {
                    outletId: 1,
                    outletName: 1,
                    openingHours: {
                        $arrayElemAt: [
                            {
                                $objectToArray: "$openingHours"
                            },
                            currentDay
                        ]
                    }
                }
            },
            {
                $unwind: "$openingHours"
            },
            {
                $addFields: {
                    openingTime: { $arrayElemAt: [{ $split: ["$openingHours.v", "-"] }, 0] },
                    closingTime: { $arrayElemAt: [{ $split: ["$openingHours.v", "-"] }, 1] },
                }
            },
            // {
            //   $match: {
            //     $expr: {
            //       $and: [
            //         { $lte: ["$openingTime", currentTime] },
            //         { $gte: ["$closingTime", currentTime] }
            //       ]
            //     }
            //   }
            // }
        ])
        return data
    } catch (error) {
        throw new Error(error.message)
    }
}

function distance(lon1, lat1, lon2, lat2) {
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));
    let r = 6371;
    return (c * r).toFixed(1);
}

// function closingTime(timing) {
//     const d = new Date
//     let day = d.getDay()
//     let time = d.toLocaleTimeString().split(" ")
//     let timeSplit = time[0].split(":")
//     let mainTime = `${timeSplit[0]}:${timeSplit[2]} ${time[1]}`
//     console.log(mainTime);
//     timing[day].forEach((element) => {
//         let closingTime = element.split("-")[1]
//         let dayNight = closingTime.split(" ")
//         console.log(dayNight);
//     })
//     return "day"
// }

// let openingHours = {
//     "0": [
//         "08:00 AM - 10:00 PM"
//     ],
//     "1": [
//         "08:00 AM - 10:00 PM"
//     ],
//     "2": [
//         "08:00 AM - 10:00 PM"
//     ],
//     "3": [
//         "08:00 AM - 10:00 PM"
//     ],
//     "4": [
//         "08:00 AM - 10:00 PM"
//     ],
//     "5": [
//         "08:00 AM - 10:00 PM"
//     ],
//     "6": [
//         "08:00 AM - 10:00 PM"
//     ]
// }
// console.log(closingTime(openingHours));


