const { addBanner, getAllBanner } = require("../helpers/banner.helper")
const { success, badRequest, unknownError } = require("../helpers/response.helper")

exports.addNewBanner = async (req, res) => {
    try {
        const { linkId } = req.body
        const { status, message } = await addBanner(req.body, linkId)
        return status ? success(res, message) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}
exports.allBanner = async (req, res) => {
    try {
        const { status, message, data } = await getAllBanner()
        return status ? success(res, message, data) : badRequest(res, message)
    } catch (error) {
        return unknownError(res, error.message)
    }
}