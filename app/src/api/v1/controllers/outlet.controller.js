const { getAllBanner } = require("../helpers/banner.helper");
const { getCuisineList, getCuisineForOutlet, addCuisine } = require("../helpers/cusion.helpers");
const { discountByDiscountId } = require("../helpers/discount.helper");
const { changeRatingInOrder } = require("../helpers/microservice.helper");
const { addOutlet, outletsBySellerId, outletByOutletId, markOutletClosedOrOpen, allOutlet, nearByOutlet, getFeaturedOutlet, homeScreenFormanter, addDiscountToOutlet, removeDiscountToOutlet, outletByCuisineId, editOutletDetails, outletCheck, changeAllOutletStatus, outletStat, markOutletVerify, allOutletPaginated, openCloseOutlets, linkBank, transactionOfOutlets, outletIdBySellerId } = require("../helpers/outlet.helper");
const { addRating } = require("../helpers/rating.helper");
const { success, badRequest, unknownError } = require("../helpers/response.helper");
const { parseJwt } = require("../middleware/authToken");
const { searchOutlet, addOutletData } = require("../services/algoila.service");
const { post } = require("../services/axios.service");
const { imageUpload } = require("../services/image.service");

exports.addNewOutlet = async (req, res) => {
    try {
        const token = parseJwt(req.headers.authorization)
        let sellerId = token.customId
        console.log(req.files);
        if (req.files) {
            if (req.files.outletImage) {
                req.body.outletImage = await imageUpload(req.files.outletImage[0])
            }
            if (req.files.outletBanner) {
                req.body.outletBanner = await imageUpload(req.files.outletBanner[0])
            }
        }
        if (token.role == 3) {
            sellerId = req.body.sellerId
        }
        const cuisineList = await getCuisineForOutlet(req.body.cuisines)
        const { status, message, data } = await addOutlet(sellerId, req.body, cuisineList);
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error);
    }
}
exports.getSellerOutlet = async (req, res) => {
    try {
        const token = parseJwt(req.headers.authorization)
        const { mode, searchId } = req.query
        let sellerId = token.customId
        if (token.role == 3) {
            sellerId = searchId
        }
        const { status, message, data } = await outletsBySellerId(sellerId, mode);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error);
    }
}
exports.getOutlet = async (req, res) => {
    try {
        const { outletId } = req.params
        const { status, message, data } = await outletByOutletId(outletId);
        // const data = await openCloseOutlets()
        return true ? success(res, "message", data) : badRequest(res, "message")
    } catch (error) {
        unknownError(res, error);
    }
}
exports.updateOutlet = async (req, res) => {
    try {
        const { outletId } = req.params
        console.log(req.files);
        if (req.files) {
            if (req.files.outletImage) {
                req.body.outletImage = await imageUpload(req.files.outletImage[0])
            }
            if (req.files.outletBanner) {
                req.body.outletBanner = await imageUpload(req.files.outletBanner[0])
            }
        }
        if (typeof req.body.cuisines === "string") {
            req.body.cuisines = JSON.parse(req.body.cuisines)
        }
        const cuisineList = await getCuisineForOutlet(req.body.cuisines)
        const { status, message, data } = await editOutletDetails(outletId, req.body, cuisineList);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        console.log(error);
        unknownError(res, error);
    }
}
exports.getOutletByCuisine = async (req, res) => {
    try {
        const { cuisineId } = req.params
        const { status, message, data } = await outletByCuisineId(cuisineId);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error);
    }
}
exports.changeClosedStatus = async (req, res) => {
    try {
        const { outletId } = req.params
        const token = parseJwt(req.headers.authorization)
        const sellerId = token.customId
        const adminCheck = token.role == 3 ? true : false
        const { status, message, data } = await markOutletClosedOrOpen(sellerId, outletId, adminCheck);
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error);
    }
}
exports.closeAllOutlet = async (req, res) => {
    try {
        const { status, message, data } = await changeAllOutletStatus();
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error);
    }
}
exports.getAllOutlet = async (req, res) => {
    try {
        const { status, message, data } = await allOutlet()
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {

        unknownError(res, error);
    }
}
exports.getAllPaginatedOutlet = async (req, res) => {
    try {
        const { page, limit } = req.query
        const { status, message, data } = await allOutletPaginated(page, limit)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {

        unknownError(res, error);
    }
}
exports.outletNearby = async (req, res) => {
    try {
        const nearByOutlets = await nearByOutlet(req.body.longitude, req.body.latitude)
        res.send(nearByOutlets)
    } catch (error) {
        unknownError(res, error);
    }
}
exports.changeDiscount = async (req, res) => {
    try {
        const { outletId, discountId } = req.body
        const { status, message, data } = await addDiscountToOutlet(outletId, discountId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error.message)
    }
}
exports.removeDiscount = async (req, res) => {
    try {
        const { outletId } = req.body
        const { status, message, data } = await removeDiscountToOutlet(outletId)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error.message)
    }
}
exports.outletDiscount = async (req, res) => {
    try {
        const { outletId } = req.params
        const outletData = await outletByOutletId(outletId)
        if (!outletData.status) {
            return badRequest(res, outletData.message)
        }
        if (!outletData.data.isDiscounted) {
            return badRequest(res, "no discount for this outlet")
        }
        let discountData = await discountByDiscountId(outletData.data.discountId)
        if (!discountData.status) {
            return badRequest(res, "no discount added")
        }
        return success(res, "discount data", discountData.data)
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}
exports.rateOutlet = async (req, res) => {

    try {
        const { outletId, orderId, skipped } = req.body
        const outletData = await outletCheck(outletId)
        if (!outletData.status) {
            return badRequest(res, outletData.message)
        }
        req.body.type = "Outlet"
        let ratingStatus = skipped ? "skipped" : "completed"
        await changeRatingInOrder(orderId, ratingStatus)
        if (skipped) {
            return success(res, "rating skipped")
        }
        let { status, message } = await addRating(outletData.data._id, req.body)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}
exports.verifyOutlet = async (req, res) => {
    try {
        const { outletId, status: verificationStatus } = req.body
        const { status, message, data } = await markOutletVerify(outletId, verificationStatus)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.homeScreen = async (req, res) => {
    try {
        // const testUpload = await imageUpload()
        const { longitude, latitude } = req.body;
        if (!longitude || !latitude) {
            return badRequest(res, "long lat is required")
        }
        const { nearByData, featuredData, allOutletData } = await homeScreenFormanter(longitude, latitude)
        const cuisineList = await getCuisineList();
        const bannerList = await getAllBanner();
        const pageData = [
            { type: "banner", title: "What's happening around", isHighlighted: false, isTitled: true, banner: bannerList.data.reverse(), category: [], slider: [], outlet: [] },
            { type: "category", title: "Find your taste", isHighlighted: false, isTitled: true, banner: [], category: cuisineList.data, slider: [], outlet: [] },
            { type: "slider", title: "slider list", banner: [], category: [], slider: [], outlet: [] },
        ]
        if (featuredData[0]) {
            pageData.push({ type: "outlet", orientation: "horizontal", isHighlighted: false, isTitled: true, title: "In Spotlight", banner: [], category: [], slider: [], outlet: featuredData })
        }
        if (nearByData[0]) {
            pageData.push({ type: "outlet", orientation: "vertical", isHighlighted: false, isTitled: true, title: "Explore around you", banner: [], category: [], slider: [], outlet: nearByData })
        }
        if (allOutletData[0]) {
            pageData.push({ type: "outlet", orientation: "vertical", isHighlighted: false, isTitled: false, title: "all restaurants", banner: [], category: [], slider: [], outlet: allOutletData })
        }
        const format = { pageData }
        return nearByData[0] || featuredData[0] ? success(res, "success", format) : badRequest(res, "we are not serving at your location currently");
    } catch (error) {
        console.log(error);
        return unknownError(res, error)
    }
}

exports.sellerTransaction = async (req, res) => {
    try {
        const token = parseJwt(req.headers.authorization)
        const outletList = await outletIdBySellerId(token.customId)
        const { from, to } = req.query
        if (!outletList.status) {
            return badRequest(res, outletList.message)
        }
        const { status, message, data } = await transactionOfOutlets(outletList.data.idList, req.headers.authorization, from, to, outletList.data.idWithDetail)
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        console.log(error);
        return unknownError(res, error)
    }
}

exports.addBankToOutlet = async (req, res) => {
    try {
        const { outletId, bankId } = req.body
        const token = req.headers.authorization
        const { status, message, data } = await linkBank(outletId, bankId, token)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.addYeloShop = async (req, res) => {
    try {
        const sellerId = 'chmod777'
        const yeloBody = {
            "api_key": "a84b3b1809db536e3684b00dc7d26e93",
            "marketplace_user_id": 1183512,
            "isClosed": 0
        }
        const response = await post(`https://api.yelo.red/open/marketplace/getMerchantList`, yeloBody)
        response.data.forEach(async (outlet) => {
            let formatedData = formatter(outlet)
            const { status, message, data } = await addOutlet(sellerId, formatedData);
            console.log(formatedData);
        })
        return success(res, "working on it")
    } catch (error) {
        await unknownError(res, "unknown error")
    }
}

exports.newCuisine = async (req, res) => {
    try {
        const { status, message, data } = await addCuisine(req.body);
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.cuisineList = async (req, res) => {
    try {
        const { status, message, data } = await getCuisineList();
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getStat = async (req, res) => {
    try {
        const { status, message, data } = await outletStat();
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        unknownError(res, error);
    }
}


exports.addToSearch = async (req, res) => {
    try {
        const { status, message, data } = await allOutlet()
        const formattedData = data.map((outlet) => {
            return {
                objectID:outlet.outletId,
                outletName: outlet.outletName,
                outletImage: outlet.outletImage,
                shopAddress: outlet.shopAddress
            }
        })
        const pushData = await addOutletData(formattedData)
        return status ? success(res, message, pushData) : badRequest(res, message)
    } catch (error) {
       
        return unknownError(res, error.message)
    }
}

exports.getSearchData = async (req, res) => {
    try {
        const searchResult = await searchOutlet(req.query)
        return searchResult ? success(res, "search result", searchResult) : badRequest(res, "nothing found")
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}

let formatter = (bodyData) => {
    let food = false
    bodyData.custom_fields[0].value == "false" ? food = true : food = false;

    return {
        outletName: bodyData.store_name,
        outletImage: bodyData.logo,
        type: bodyData.custom_fields[0].value,
        isFood: food,
        cuisine: "fast food",
        area: bodyData.display_address,
        shopAddress: bodyData.address,
        longitude: parseFloat(bodyData.longitude),
        latitude: parseFloat(bodyData.latitude),
        openingHours: {
            "0": [
                "08:00 AM - 10:00 PM"
            ],
            "1": [
                "08:00 AM - 10:00 PM"
            ],
            "2": [
                "08:00 AM - 10:00 PM"
            ],
            "3": [
                "08:00 AM - 10:00 PM"
            ],
            "4": [
                "08:00 AM - 10:00 PM"
            ],
            "5": [
                "08:00 AM - 10:00 PM"
            ],
            "6": [
                "08:00 AM - 10:00 PM"
            ]
        },
        preparationTime: 30,
    }
}
