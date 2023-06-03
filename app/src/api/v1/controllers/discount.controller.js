const { addDiscount, sellerDiscount, discountByDiscountId } = require("../helpers/discount.helper")
const { outletByDiscountId } = require("../helpers/outlet.helper")
const { success, badRequest, unknownError } = require("../helpers/response.helper")
const { parseJwt } = require("../middleware/authToken")

exports.createDiscount = async (req, res) => {
    try {
        const token = parseJwt(req.headers.authorization)
        const { status, message, data } = await addDiscount(token.customId, req.body)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getSellerDiscount = async (req, res) => {
    try {
        const token = parseJwt(req.headers.authorization)
        const { status, message, data } = await sellerDiscount(token.customId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}

exports.getDiscountById = async (req, res) => {
    try {
        const { discountId } = req.params
        const { status, message, data } = await discountByDiscountId(discountId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}
exports.getOutletByDiscountId = async (req, res) => {
    try {
        const { discountId } = req.params
        const { status, message, data } = await outletByDiscountId(discountId)
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}